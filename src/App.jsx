import { useEffect, useState } from "react";
import ChecklistMensual from "./components/ChecklistMensual";
import TransaccionForm from "./components/TransaccionForm";
import HistorialCierres from "./components/HistorialCierres";
import axios from "axios";

export default function App() {
  const hoy = new Date();
  const mesActual = hoy.getMonth() + 1;
  const anioActual = hoy.getFullYear();

  const [mesPermitido, setMesPermitido] = useState(mesActual);
  const [anioPermitido, setAnioPermitido] = useState(anioActual);
  const [bloqueado, setBloqueado] = useState(false);
  const [refrescarHistorial, setRefrescarHistorial] = useState(false);

  useEffect(() => {
    const { mesAnterior, anioAnterior } = obtenerMesAnterior(mesActual, anioActual);

    axios
      .get(`${import.meta.env.VITE_API_URL}api/resumen-mensual?mes=${mesAnterior}&anio=${anioAnterior}`)
      .then((res) => {
        if (res.data?.id) {
          setMesPermitido(mesActual);
          setAnioPermitido(anioActual);
          setBloqueado(false);
        } else {
          setMesPermitido(mesAnterior);
          setAnioPermitido(anioAnterior);
          setBloqueado(true);
        }
      })
      .catch(() => {
        setMesPermitido(mesAnterior);
        setAnioPermitido(anioAnterior);
        setBloqueado(true);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Título con imagen de fondo */}
      <div
        className="relative text-center h-48 flex items-center justify-center bg-cover bg-center rounded-lg shadow-md mb-6"
        style={{ backgroundImage: 'url("/fondo-header.jpg")' }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white bg-black bg-opacity-50 px-6 py-2 rounded-lg shadow-lg">
          Finanzas Familia Granado Lopez
        </h1>
      </div>

      {/* Layout de 12 columnas en escritorio */}
      <div className="p-6 max-w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Transacciones - 3 columnas */}
        <div className="md:col-span-3">
          <TransaccionForm />
        </div>

        {/* Checklist - 3 columnas */}
        <div className="md:col-span-3">
          {bloqueado && (
            <div className="text-red-600 mb-4 font-semibold text-center">
              🔴 Tienes un mes anterior sin cerrar. Por favor cierra el mes {nombreMes(mesPermitido)} {anioPermitido}.
            </div>
          )}
          <ChecklistMensual
            key={`${mesPermitido}-${anioPermitido}`}
            mes={mesPermitido}
            anio={anioPermitido}
            onMesCerrado={() => {
              axios
                .post(`${import.meta.env.VITE_API_URL}api/gastos-mensuales/copiar`, null, {
                  params: {
                    mes: mesActual,
                    anio: anioActual,
                  },
                })
                .then(() => {
                  setBloqueado(false);
                  setMesPermitido(mesActual);
                  setAnioPermitido(anioActual);
                  setRefrescarHistorial((prev) => !prev);
                });
            }}
            onCierreRestablecido={() => {
              setBloqueado(false);
              setRefrescarHistorial((prev) => !prev);
            }}
          />
        </div>

        {/* Historial - 6 columnas */}
        <div className="md:col-span-6">
          <HistorialCierres
            refrescar={refrescarHistorial}
            onEditar={(mes, anio) => {
              setMesPermitido(mes);
              setAnioPermitido(anio);
              setBloqueado(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}

function obtenerMesAnterior(mes, anio) {
  if (mes === 1) {
    return { mesAnterior: 12, anioAnterior: anio - 1 };
  } else {
    return { mesAnterior: mes - 1, anioAnterior: anio };
  }
}

function nombreMes(mes) {
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  return meses[mes - 1];
}














