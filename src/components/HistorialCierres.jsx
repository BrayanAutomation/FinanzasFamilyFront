import { useEffect, useState } from "react";
import axios from "axios";

export default function HistorialCierres({ onEditar, refrescar }) {
  const [cierres, setCierres] = useState([]);

  useEffect(() => {
    axios
      .get("http://192.168.1.1:8080/api/resumen-mensual/historial")
      .then((res) => setCierres(res.data));
  }, [refrescar]);

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">📊 Historial de Cierres</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Mes</th>
            <th className="p-2">Año</th>
            <th className="p-2">Fecha Cierre</th>
            <th className="p-2">Completo</th>
            <th className="p-2">Acción</th>
          </tr>
        </thead>
        <tbody>
          {cierres.map((cierre) => (
            <tr key={cierre.id} className="border-t">
              <td className="p-2">{nombreMes(cierre.mes)}</td>
              <td className="p-2">{cierre.anio}</td>
              <td className="p-2">{formatearFecha(cierre.fechaCierre)}</td>
              <td className="p-2">{cierre.completo ? "✅" : "❌"}</td>
              <td className="p-2">
                <button
                  onClick={() => onEditar(cierre.mes, cierre.anio)}
                  className="text-green-600 hover:underline text-sm"
                >
                  ✏️ Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}



