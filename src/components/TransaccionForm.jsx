import { useState, useEffect } from "react";
import axios from "axios";

export default function TransaccionForm() {
  const [descripcion, setDescripcion] = useState("");
  const [valor, setValor] = useState("");
  const [fecha, setFecha] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [mesCalculo, setMesCalculo] = useState("");
  const [montoDisponible, setMontoDisponible] = useState("");
  const [resultado, setResultado] = useState(null);
  const [transaccionesMes, setTransaccionesMes] = useState([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}api/categorias`)
      .then((res) => setCategorias(res.data));
  }, []);

  const agregarTransaccion = () => {
    if (!descripcion || !valor || !fecha || !categoriaId) return;

    const fechaSeleccionada = new Date(fecha);

    const data = {
      descripcion,
      monto: parseFloat(valor),
      fecha,
      mes: fechaSeleccionada.getMonth() + 1,
      anio: fechaSeleccionada.getFullYear(),
      categoria: {
        id: parseInt(categoriaId)
      }
    };

    axios.post(`${import.meta.env.VITE_API_URL}api/transacciones`, data).then(() => {
      setDescripcion("");
      setValor("");
      setFecha("");
      setCategoriaId("");
      alert("✅ Transacción registrada");
    });
  };

  const calcularGastoPorMes = () => {
    if (!mesCalculo || !montoDisponible) return;

    axios
      .get(`${import.meta.env.VITE_API_URL}api/transacciones?mes=${mesCalculo}`)
      .then((res) => {
        const transacciones = res.data;
        setTransaccionesMes(transacciones);

        const totalGastos = transacciones.reduce(
          (acc, t) => acc + parseFloat(t.monto),
          0
        );

        const saldo = parseFloat(montoDisponible) - totalGastos;
        setResultado({
          totalGastos,
          saldo,
        });
      });
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold text-center mb-4">Transacciones</h2>

      {/* Formulario */}
      <div className="flex flex-col gap-2 mb-6">
        <input
          type="text"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="number"
          placeholder="Valor"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <select
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">Seleccionar categoría</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
        <button
          onClick={agregarTransaccion}
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          ➕ Agregar Transacción
        </button>
      </div>

      <hr className="my-6" />

      {/* Calculo */}
      <h3 className="text-lg font-semibold mb-2">Calcular gasto por mes</h3>
      <div className="flex flex-col gap-2 mb-4">
        <input
          type="number"
          placeholder="Mes a calcular (1-12)"
          value={mesCalculo}
          onChange={(e) => setMesCalculo(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="number"
          placeholder="Monto disponible"
          value={montoDisponible}
          onChange={(e) => setMontoDisponible(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <button
          onClick={calcularGastoPorMes}
          className="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          📊 Calcular gasto
        </button>
      </div>

      {resultado && (
        <div className="bg-gray-100 p-4 rounded shadow-sm mt-4">
          <h4 className="font-bold text-gray-700 mb-2">
            Transacciones del mes {mesCalculo}
          </h4>
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="text-left border-b">
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {transaccionesMes.map((t) => (
                <tr key={t.id} className="border-b">
                  <td>{t.descripcion}</td>
                  <td>{t.categoria?.nombre || "Sin categoría"}</td>
                  <td>${parseFloat(t.monto).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-sm font-semibold text-gray-700">
            Total gastado: ${resultado.totalGastos.toLocaleString()}
          </p>
          <p
            className={`font-bold text-lg ${
              resultado.saldo < 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            Saldo restante: ${resultado.saldo.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}



