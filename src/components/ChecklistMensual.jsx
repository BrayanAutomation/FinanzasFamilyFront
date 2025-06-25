import { useEffect, useState } from "react";
import axios from "axios";

export default function ChecklistMensual({ mes = 6, anio = 2025, onMesCerrado, onCierreRestablecido }) {
  const [gastos, setGastos] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [valor, setValor] = useState("");
  const [cerrado, setCerrado] = useState(false);
  const [resumenId, setResumenId] = useState(null);

  const urlGastos = `${import.meta.env.VITE_API_URL}api/gastos-mensuales`;
  const urlResumen = `${import.meta.env.VITE_API_URL}api/resumen-mensual`;

  useEffect(() => {
    cargarGastos();
    verificarCierreMes();
  }, [mes, anio]);

  const cargarGastos = () => {
    axios
      .get(`${urlGastos}?mes=${mes}&anio=${anio}`)
      .then((res) => setGastos(res.data));
  };

  const verificarCierreMes = () => {
    axios
      .get(`${urlResumen}?mes=${mes}&anio=${anio}`)
      .then((res) => {
        if (res.data?.id) {
          setCerrado(true);
          setResumenId(res.data.id);
        } else {
          setCerrado(false);
        }
      });
  };

  const agregarGasto = () => {
    if (!descripcion || !valor) return;

    axios
      .post(urlGastos, {
        descripcion,
        valor: parseInt(valor),
        pagado: false,
        mes,
        anio,
      })
      .then(() => {
        setDescripcion("");
        setValor("");
        cargarGastos();
      });
  };

  const eliminarGasto = (id) => {
    axios.delete(`${urlGastos}/${id}`).then(cargarGastos);
  };

  const togglePagado = (id, pagado) => {
    axios
      .put(`${urlGastos}/${id}/pagar?pagado=${!pagado}`)
      .then(() => {
        setGastos((prev) =>
          prev.map((g) =>
            g.id === id ? { ...g, pagado: !pagado } : g
          )
        );
      });
  };

  const cerrarMes = () => {
    const confirmacion = window.confirm("¿Estás seguro de cerrar este mes? Se guardará si hay deudas o no.");
    if (!confirmacion) return;

    const todosPagados = gastos.every((g) => g.pagado);

    axios
      .post(`${urlResumen}/cerrar`, null, {
        params: {
          mes,
          anio,
          completo: todosPagados,
        },
      })
      .then(() => {
        setCerrado(true);
        if (todosPagados) {
          alert(`🎉 ¡Felicidades! Has pagado todas tus deudas del mes ${nombreMes(mes)}`);
        } else {
          alert(`⚠️ Aún quedaron deudas en el mes ${nombreMes(mes)}`);
        }
        if (onMesCerrado) onMesCerrado();
      });
  };

  const restablecerCierre = () => {
    axios
      .delete(`${urlResumen}?mes=${mes}&anio=${anio}`)
      .then(() => {
        setCerrado(false);
        setResumenId(null);
        alert("🔁 Cierre eliminado. Puedes editar nuevamente el mes.");
        if (onCierreRestablecido) onCierreRestablecido();
      });
  };

  const total = gastos.reduce((acc, g) => acc + g.valor, 0);
  const pagados = gastos.filter((g) => g.pagado).length;

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold text-center mb-4">
        Checklist {nombreMes(mes)} {anio}
      </h2>

      {/* Campos responsivos */}
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Descripción"
          className="flex-1 border px-3 py-2 rounded w-full"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        <input
          type="number"
          placeholder="Valor"
          className="w-full md:w-32 border px-3 py-2 rounded"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />
        <button
          onClick={agregarGasto}
          className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 w-full md:w-auto"
        >
          ➕
        </button>
      </div>

      <ul className="space-y-3">
        {gastos.map((g) => (
          <li key={g.id} className="flex justify-between items-center border-b pb-1">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={g.pagado}
                disabled={cerrado}
                onChange={() => togglePagado(g.id, g.pagado)}
              />
              <span className={g.pagado ? "line-through text-gray-400" : ""}>
                {g.descripcion} - ${g.valor.toLocaleString()}
              </span>
            </label>
            <button
              onClick={() => eliminarGasto(g.id)}
              className="text-red-500 hover:text-red-700"
            >
              🗑️
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 text-sm text-gray-600 flex justify-between">
        <span>Total: ${total.toLocaleString()}</span>
        <span>Pagados: {pagados} / {gastos.length}</span>
      </div>

      {!cerrado && (
        <div className="mt-6">
          <button
            onClick={cerrarMes}
            className="bg-indigo-600 text-white w-full py-2 rounded hover:bg-indigo-700"
          >
            🚪 Cerrar mes
          </button>
        </div>
      )}

      {cerrado && (
        <div className="mt-4 text-center">
          <p className="text-green-600 font-semibold">
            ✅ Este mes ya fue cerrado.
          </p>
          <button
            onClick={restablecerCierre}
            className="mt-2 text-sm text-red-500 hover:text-red-700 underline"
          >
            🛠️ Restablecer cierre
          </button>
        </div>
      )}
    </div>
  );
}

function nombreMes(mes) {
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  return meses[mes - 1];
}





