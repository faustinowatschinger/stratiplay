import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { getAuth } from 'firebase/auth';
import { auth, db } from '../firebase';
import axios from 'axios';
import { useUserPlan } from '../context/userPlanContext';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

/* Componente TaskTimer: recibe el tiempo inicial (en minutos) y una función onRemove para eliminarlo */
function TaskTimer({ initialTime, onRemove }) {
  const [timeLeft, setTimeLeft] = useState(initialTime * 60); // convertimos minutos a segundos
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft]);

  const handleStart = () => {
    if (!isRunning && timeLeft > 0) {
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
    clearInterval(timerRef.current);
  };

  const handleReset = () => {
    setIsRunning(false);
    clearInterval(timerRef.current);
    setTimeLeft(initialTime * 60);
  };

  const handleDelete = () => {
    setIsRunning(false);
    clearInterval(timerRef.current);
    onRemove(); // se oculta el temporizador en la tarea
  };

  // Formateamos minutos y segundos
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex flex-col items-center justify-center ">
      <div className="font-mono bg-[#252525] p-1">
        {minutes}:{seconds.toString().padStart(2, '0')}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-1 bg-[#252525] p-1 rounded-lg">
        <button onClick={handleStart} className="">Iniciar</button>
        <button onClick={handlePause} className=" ">Pausar</button>
        <button onClick={handleReset} className=" ">Reiniciar</button>
        <button onClick={handleDelete} className=" ">Eliminar</button>
      </div>
    </div>
  );
}
/* Componente TaskRow: renderiza la fila de la tarea y administra la visualización del temporizador */
const TaskRow = ({ diaEstudio, diaIndex, tarea, originalIndex, handleEstadoTareaChange, handlePrioridadTareaChange }) => {
  const [showTimer, setShowTimer] = useState(false);

  const handleShowTimer = () => setShowTimer(true);
  const handleRemoveTimer = () => setShowTimer(false);

  return (
    <tr className="border-t border-b border-black xl:table-row block" key={`${diaIndex}-${originalIndex}`}>
      <td className="px-4 py-2 border-t border-b border-black xl:table-cell block">{diaEstudio.dia}</td>
      <td className="px-4 py-2 border-t border-b border-black xl:table-cell block">{tarea.titulo}</td>
      <td className="px-4 py-2 border-t border-b border-black xl:table-cell block">{tarea.descripcion}</td>
      <td className="px-4 py-2 border-t border-b border-black xl:table-cell block">{tarea.contenido}</td>
      <td className="px-4 py-2 border-t border-b border-black xl:table-cell block">{tarea.tiempo} min</td>
      <td className="px-4 py-2 border-t border-b border-black xl:table-cell block">
        <select
          value={tarea.estado}
          onChange={(e) => handleEstadoTareaChange(diaIndex, originalIndex, e.target.value)}
          className="w-max"
        >
          <option value="esperando">Esperando</option>
          <option value="enProgreso">En progreso</option>
          <option value="finalizado">Finalizado</option>
        </select>
      </td>
      <td className="px-4 py-2 border-t border-b border-black xl:table-cell block">
        <select
          value={tarea.prioridad}
          onChange={(e) => handlePrioridadTareaChange(diaIndex, originalIndex, e.target.value)}
          className="w-max"
        >
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
        </select>
      </td>
      <td className="px-4 py-2 border-t border-b border-black xl:table-cell block">
        {tarea.estado !== "finalizado" && (
          showTimer ? (
            <TaskTimer initialTime={tarea.tiempo} onRemove={handleRemoveTimer} />
          ) : (
            <button onClick={handleShowTimer} className="text-white bg-[#252525] w-full p-1 rounded-lg">
              Iniciar Temporizador
            </button>
          )
        )}
      </td>
    </tr>
  );
};

function InformacionCampo() {
  const location = useLocation();
  const navigate = useNavigate();
  const { planId } = location.state || {};
  const [planEstudio, setPlanEstudio] = useState(null);
  const [tareasFinalizadas, setTareasFinalizadas] = useState([]);
  const [objetivosFinalizados, setObjetivosFinalizados] = useState([]);
  const [tareasConEstado, setTareasConEstado] = useState([]);
  const [objetivosConEstado, setObjetivosConEstado] = useState([]);
  const [estadoTabla, setEstadoTabla] = useState("todas");
  const [prioridadTabla, setPrioridadTabla] = useState("todas");
  const [estadoTablaObjetivo, setEstadoTablaObjetivo] = useState("todas");
  const [porcentajeSemana, setProcentajeSemana] = useState(0);
  const [progreso, setProgreso] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [progressCount, setProgressCount] = useState(0);
  const [createdAt, setCreatedAt] = useState(null);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [verificado, setVerificado] = useState(false);
  const { userPlan, loading } = useUserPlan();
  const [botonProgresar, setBotonProgresar] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Cargar el plan de estudio
  useEffect(() => {
    if (!planId) {
      console.error('planId no está definido');
      return;
    }
    const fetchPlanEstudio = async () => {
      try {
        const authInst = getAuth();
        const token = await authInst.currentUser.getIdToken();
        const response = await axios.get(`https://api.stratiplay.com/api/chat/obtener-plan/${planId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const planData = response.data;
        setPlanEstudio(planData);
        setCreatedAt(planData.createdAt);

        const tareasInicializadas = planData.planEstudio.map((dia) => ({
          ...dia,
          tareas: dia.tareas?.map((tarea) => ({
            ...tarea,
            estado: tarea.estado || "esperando",
            prioridad: tarea.prioridad || "media",
          })) || [],
        }));
        setTareasConEstado(tareasInicializadas);

        const objetivosInicializados = planData.objetivos.map((objetivo) => ({
          ...objetivo,
          estado: objetivo.estado || "esperando",
        }));
        setObjetivosConEstado(objetivosInicializados);
      } catch (error) {
        console.error('Error al obtener el plan de estudio:', error);
      }
    };

    fetchPlanEstudio();
  }, [planId]);

  useEffect(() => {
    if (planEstudio && planEstudio.createdAt) {
      setCreatedAt(new Date(planEstudio.createdAt));
    }
  }, [planEstudio]);

  useEffect(() => {
    if (createdAt) {
      const interval = setInterval(() => {
        const now = new Date();
        const unaSemanaEnMilisegundos = 7 * 24 * 60 * 60 * 1000;
        const restante = unaSemanaEnMilisegundos - (now - createdAt);
        setTiempoRestante(restante > 0 ? restante : 0);
        setVerificado(true);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [createdAt]);

  useEffect(() => {
    const tareasFin = tareasConEstado.flatMap(dia =>
      dia.tareas.filter(tarea => tarea.estado === "finalizado")
    );
    setTareasFinalizadas(tareasFin);
    const objetivosFin = objetivosConEstado.filter(objetivo => objetivo.estado === "finalizado");
    setObjetivosFinalizados(objetivosFin);
    setProcentajeSemana(
      ((objetivosFin.length + tareasFin.length) /
        (objetivosConEstado.length + tareasConEstado.flatMap(dia => dia.tareas).length)) * 100
    );
  }, [tareasConEstado, objetivosConEstado]);

  useEffect(() => {
    const fetchUserProgressCount = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, "usuarios", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setProgressCount(userDocSnap.data().progressCount || 0);
          } else {
            await setDoc(userDocRef, { progressCount: 0 });
            setProgressCount(0);
          }
        }
      } catch (error) {
        console.error("Error al cargar progressCount:", error);
      }
    };
    fetchUserProgressCount();
  }, []);

  const handleProgresarPlan = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No estás autenticado. Por favor, inicia sesión.");
      const newProgressCount = progressCount + 1;
      setProgressCount(newProgressCount);
      const userDocRef = doc(db, "usuarios", user.uid);
      await updateDoc(userDocRef, { progressCount: newProgressCount });
      const token = await user.getIdToken();
      if (!planId) throw new Error("No se encontró el ID del plan de estudio a progresar.");
      
      const informacionTema = {
        campo: planEstudio.campo,
        nivelIntensidad: planEstudio.nivelIntensidad,
        diasEstudio: planEstudio.diasEstudio,
        horasEstudio: planEstudio.horasEstudio,
        tareasCompletadas: tareasFinalizadas || [],
        objetivosCompletados: objetivosFinalizados || [],
        nuevaInformacion: userPlan === 'pro' ? progreso : undefined,
      };
      
      let datosEnviar = { ...informacionTema };
      if (planEstudio.campo === "Ajedrez") {
        datosEnviar = {
          ...datosEnviar,
          experienciaAjedrez: planEstudio.experienciaAjedrez,
          elo: planEstudio.elo,
          tiempo: planEstudio.tiempo,
          conocimientosAjedrez: planEstudio.conocimientosAjedrez,
        };
      } else if (planEstudio.campo === "Poker Texas Holdem") {
        datosEnviar = {
          ...datosEnviar,
          tipoPoker: planEstudio.tipoPoker,
          limiteMesa: planEstudio.limiteMesa,
          conocimientosPoker: planEstudio.conocimientosPoker,
        };
      }
      
      console.log('Datos enviados:', { informacionTema: datosEnviar, planId });
      
      const response = await axios.post(
        'https://api.stratiplay.com/api/chat/custom-prompt',
        { 
          informacionTema: datosEnviar, 
          eliminarAnterior: true,
          planId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      setPlanEstudio(response.data);
      window.location.href = "/catalogo-planes-de-estudio";
  
    } catch (error) {
      console.error('Error al progresar el plan de estudio:', error);
      setPlanEstudio("Ocurrió un error al generar tu plan de estudio. Por favor, intenta nuevamente.");
    } finally {
      setCargando(false);
    }
  };
  
  if (cargando) {
    return <div className="w-20 h-20 border-4 border-white m-auto border-t-black rounded-full animate-spin"></div>;
  }

  if (!planEstudio || !verificado) {
    return <div className="w-20 h-20 border-4 border-white m-auto border-t-black rounded-full animate-spin"></div>;
  }
  
  const actualizarEstadoTareaEnBD = async (planId, diaIndex, tareaIndex, nuevoEstado, nuevaPrioridad) => {
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error("No estás autenticado. Por favor, inicia sesión.");
      const token = await user.getIdToken();
      await axios.post(
        'https://api.stratiplay.com/api/chat/actualizar-estado-tarea',
        { planId, diaIndex, tareaIndex, nuevoEstado, nuevaPrioridad },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Estado y/o prioridad de la tarea actualizados correctamente en la base de datos');
    } catch (error) {
      console.error('Error al actualizar el estado y/o prioridad en la base de datos:', error);
      throw new Error('Error al actualizar el estado y/o prioridad en la base de datos');
    }
  };

  const actualizarEstadoObjetivoEnBD = async (planId, objetivoIndex, nuevoEstado) => {
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error("No estás autenticado. Por favor, inicia sesión.");
      const token = await user.getIdToken();
      await axios.post(
        'https://api.stratiplay.com/api/chat/actualizar-estado-objetivo',
        { planId, objetivoIndex, nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Estado del objetivo actualizado correctamente en la base de datos');
    } catch (error) {
      console.error('Error al actualizar el estado del objetivo en la base de datos:', error);
      throw new Error('Error al actualizar el estado del objetivo en la base de datos');
    }
  };

  const handleEstadoTareaChange = async (diaIndex, tareaIndex, nuevoEstado) => {
    try {
      setTareasConEstado(prevState => {
        const newState = [...prevState];
        newState[diaIndex].tareas[tareaIndex].estado = nuevoEstado;
        return newState;
      });
      await actualizarEstadoTareaEnBD(planId, diaIndex, tareaIndex, nuevoEstado, null);
    } catch (error) {
      console.error('Error al actualizar el estado de la tarea:', error);
    }
  };

  const handleEstadoObjetivoChange = async (objetivoIndex, nuevoEstado) => {
    try {
      setObjetivosConEstado(prevState => {
        const newState = [...prevState];
        newState[objetivoIndex].estado = nuevoEstado;
        return newState;
      });
      await actualizarEstadoObjetivoEnBD(planId, objetivoIndex, nuevoEstado);
    } catch (error) {
      console.error('Error al actualizar el estado del objetivo:', error);
    }
  };

  const handlePrioridadTareaChange = async (diaIndex, tareaIndex, nuevaPrioridad) => {
    try {
      setTareasConEstado(prevState => {
        const newState = [...prevState];
        newState[diaIndex].tareas[tareaIndex].prioridad = nuevaPrioridad;
        return newState;
      });
      await actualizarEstadoTareaEnBD(planId, diaIndex, tareaIndex, null, nuevaPrioridad);
    } catch (error) {
      console.error('Error al actualizar la prioridad de la tarea:', error);
    }
  };

  const handleEstadoTablaChange = (e) => {
    setEstadoTabla(e.target.value);
  };

  const handlePrioridadTablaChange = (e) => {
    setPrioridadTabla(e.target.value);
  };

  const handleEstadoTablaObjetivoChange = (e) => {
    setEstadoTablaObjetivo(e.target.value);
  };

  const totalTareas = planEstudio.planEstudio.reduce((total, dia) => total + dia.tareas.length, 0);

  return (
    <article className="flex flex-col items-center justify-center min-h-screen p-0 sm:p-4 md:p-6 lg:p-10 text-white">
      <section className="w-full">
        <section className="flex flex-col items-center w-full mt-0 justify-center">
          <h2 className="text-xl sm:text-3xl md:text-4xl">{planEstudio.campo}</h2>
          <img
            className="w-36"
            src={
              planEstudio.campo === "Poker Texas Holdem"
                ? "/imagenes/cartas-de-poquer.webp"
                : planEstudio.campoEstudio === "Ajedrez"
                ? "/imagenes/ajedrez.webp"
                : null
            }
            alt={
              planEstudio.campoEstudio === "Poker Texas Holdem"
                ? "Poker"
                : planEstudio.campoEstudio === "Ajedrez"
                ? "Ajedrez"
                : null
            }
          />
          <div>
            {botonProgresar ? (
              <div className="text-base md:text-lg bg-[#252525] text-white py-2 px-4 rounded-lg shadow-md hover:bg-[#1a1a1a] transition duration-300"></div>
            ) : (
              <>
                {userPlan === 'pro' && porcentajeSemana === 100 && tiempoRestante === 0 && (
                  <div className="flex flex-col items-center justify-center">
                    <textarea
                      id="nuevaInformacion"
                      rows={5}
                      value={progreso}
                      onChange={(e) => setProgreso(e.target.value)}
                      placeholder="Información para el nuevo plan..."
                      className="w-full p-2 border text-start rounded"
                    />
                    <button onClick={handleProgresarPlan} className="bg-[#252525] p-1 rounded-lg mt-2">
                      Avanzar
                    </button>
                  </div>
                )}
                {userPlan === 'basic' && porcentajeSemana === 100 && tiempoRestante === 0 && (
                  <button onClick={handleProgresarPlan} className="bg-[#252525] p-1 rounded-lg">
                    Avanzar
                  </button>
                )}
                {userPlan === 'gratuito' && porcentajeSemana === 100 && progressCount < 3 && tiempoRestante === 0 && (
                  <button onClick={handleProgresarPlan} className="bg-[#252525] p-1 rounded-lg">
                    Avanzar
                  </button>
                )}
                {userPlan === 'gratuito' && progressCount >= 3 && tiempoRestante === 0 && (
                  <p className="text-white">
                    Has alcanzado el límite de 3 progresiones en el plan gratuito. Considera actualizar a un plan superior para continuar progresando.
                  </p>
                )}
              </>
            )}
            {mensaje && <p>{mensaje}</p>}
          </div>
        </section>
        <section className="flex flex-col md:flex-row items-center justify-center gap-10">
          <div className="flex flex-col items-center justify-center">
            <p className="mb-5 text-xl">Semana terminada</p>
            <div className="relative w-32 h-32">
              <CircularProgressbar
                value={porcentajeSemana || 0}
                styles={buildStyles({ pathColor: "#252525", trailColor: "#D6D6D6" })}
              />
              <div className="absolute inset-0 flex items-center justify-center text-white text-lg">
                {`${(porcentajeSemana || 0).toFixed(2)}%`}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="mb-5 text-xl">Tareas terminadas</p>
            <div className="relative w-32 h-32">
              <CircularProgressbar
                value={(tareasFinalizadas.length / totalTareas) * 100}
                styles={buildStyles({ pathColor: "#252525", trailColor: "#D6D6D6" })}
              />
              <div className="absolute inset-0 flex items-center justify-center text-white text-lg">
                {`${tareasFinalizadas.length}/${totalTareas}`}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="mb-5 text-xl">Objetivos terminados</p>
            <div className="relative w-32 h-32">
              <CircularProgressbar
                value={(objetivosFinalizados.length / objetivosConEstado.length) * 100}
                styles={buildStyles({ pathColor: "#252525", trailColor: "#D6D6D6" })}
              />
              <div className="absolute inset-0 flex items-center justify-center text-white text-lg">
                {`${objetivosFinalizados.length}/${objetivosConEstado.length}`}
              </div>
            </div>
          </div>
        </section>
        <section className="flex flex-col items-center w-full justify-center">
          <h3 className="text-2xl">Tareas</h3>
          <div className="flex flex-col xl:flex-row items-center justify-center gap-10 mt-10">
            <div className="flex flex-col items-center justify-center">
              <h4>Estado</h4>
              <select onChange={handleEstadoTablaChange} className="style-input" name="estado" id="estado">
                <option value="todas">Todas</option>
                <option value="esperando">Esperando</option>
                <option value="enProgreso">En progreso</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>
            <div>
              <h4>Prioridad</h4>
              <select onChange={handlePrioridadTablaChange} className="style-input" name="prioridad" id="prioridad">
                <option value="todas">Todas</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>
  
          <div className="overflow-x-auto w-full">
            <table className="border-separate border-spacing-4 w-full xl:table block">
              <tbody className="xl:table-row-group block">
                {tareasConEstado.map((diaEstudio, diaIndex) => {
                  const tareasConIndiceOriginal = diaEstudio.tareas.map((tarea, originalIndex) => ({
                    ...tarea,
                    originalIndex
                  }));
  
                  const tareasFiltradas = tareasConIndiceOriginal.filter((tarea) =>
                    (estadoTabla === "todas" || tarea.estado === estadoTabla) &&
                    (prioridadTabla === "todas" || tarea.prioridad === prioridadTabla)
                  );
  
                  return tareasFiltradas.map((tarea) => (
                    <TaskRow
                      key={`${diaIndex}-${tarea.originalIndex}`}
                      diaEstudio={diaEstudio}
                      diaIndex={diaIndex}
                      tarea={tarea}
                      originalIndex={tarea.originalIndex}
                      handleEstadoTareaChange={handleEstadoTareaChange}
                      handlePrioridadTareaChange={handlePrioridadTareaChange}
                    />
                  ));
                })}
              </tbody>
            </table>
          </div>
        </section>
        <section className="flex flex-col items-center w-full justify-center">
          <h3 className="text-2xl">Objetivos</h3>
          <div className="flex flex-col items-center justify-center mt-10">
            <h3>Estado</h3>
            <select
              onChange={handleEstadoTablaObjetivoChange}
              className="style-input w-max"
              name="estado"
              id="estado"
            >
              <option value="todas">Todas</option>
              <option value="esperando">Esperando</option>
              <option value="enProgreso">En progreso</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>
  
          <div className="overflow-x-auto w-full">
            <table className="table-auto border-separate border-spacing-4 w-full lg:table block">
              <tbody className="lg:table-row-group block">
                {(() => {
                  const objetivosConIndiceOriginal = (objetivosConEstado || []).map((objetivo, originalIndex) => ({
                    ...objetivo,
                    originalIndex,
                  }));
                  const objetivosFiltrados = objetivosConIndiceOriginal.filter(
                    (objetivo) =>
                      estadoTablaObjetivo === "todas" || objetivo.estado === estadoTablaObjetivo
                  );
                  return objetivosFiltrados.map((objetivo) => (
                    <tr
                      key={objetivo.id || objetivo.originalIndex}
                      className="border-t border-b border-black lg:table-row block"
                    >
                      <td className="px-4 py-2 border-t border-b border-black lg:table-cell block">
                        {objetivo.titulo}
                      </td>
                      <td className="px-4 py-2 border-t border-b border-black lg:table-cell block">
                        {objetivo.descripcion}
                      </td>
                      <td className="px-4 py-2 border-t border-b border-black lg:table-cell block">
                        <select
                          value={objetivo.estado}
                          className="w-max"
                          onChange={(e) => handleEstadoObjetivoChange(objetivo.originalIndex, e.target.value)}
                        >
                          <option value="esperando">Esperando</option>
                          <option value="enProgreso">En progreso</option>
                          <option value="finalizado">Finalizado</option>
                        </select>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </article>
  );
}

export default InformacionCampo;
