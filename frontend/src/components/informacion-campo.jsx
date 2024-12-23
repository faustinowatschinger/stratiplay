import { useLocation, useNavigate } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { useState, useEffect } from 'react';
import { getAuth } from "firebase/auth";
import axios from 'axios';

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
    const [porcentajeSemana, setProcentajeSemana] = useState();

    useEffect(() => {
        if (!planId) {
            console.error('planId no está definido');
            return;
        }

        const fetchPlanEstudio = async () => {
            try {
                const auth = getAuth();
                const user = auth.currentUser;
                if (!user) {
                    throw new Error("No estás autenticado. Por favor, inicia sesión.");
                }

                const token = await user.getIdToken();

                const response = await axios.get(`http://localhost:5000/api/chat/obtener-plan/${planId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const planData = response.data;
                setPlanEstudio(planData);

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

    const handlePrograsarPlan = async () => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No estás autenticado. Por favor, inicia sesión.");
            }
    
            const token = await user.getIdToken();
    
            const tareasCompletadas = tareasConEstado.flatMap(dia =>
                dia.tareas.filter(tarea => tarea.estado === "finalizado")
            );
            const objetivosCompletados = objetivosConEstado.filter(objetivo => objetivo.estado === "finalizado");
    
            const informacionTema = {
                campo: planEstudio.campoEstudio,
                nivelIntensidad: planEstudio.nivelIntensidad,
                diasEstudio: planEstudio.diasEstudio,
                tareasCompletadas,
                objetivosCompletados,
                ...(planEstudio.campoEstudio === "Ajedrez" && {
                    elo: planEstudio.elo,
                    experienciaAjedrez: planEstudio.experienciaAjedrez,
                    pgnFile: planEstudio.pgnFile,
                }),
                ...(planEstudio.campoEstudio === "Poker Texas Holdem" && {
                    tipoPoker: planEstudio.tipoPoker,
                    pokerHands: planEstudio.pokerHands,
                    limiteMesa: planEstudio.limiteMesa,
                    softwaresPoker: planEstudio.softwaresPoker,
                }),
            };
    
            const response = await axios.post(
                'http://localhost:5000/api/chat/custom-prompt',
                { informacionTema },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
    
            const nuevoPlanEstudio = response.data;
    
            // Eliminar el plan actual
            await axios.delete(`http://localhost:5000/api/chat/eliminar-plan/${planId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            window.location.href = "/catalogo-campos";
        } catch (error) {
            console.error('Error al generar el nuevo plan de estudio:', error);
        }
    };

    useEffect(() => {
        const tareasFinalizadas = tareasConEstado.flatMap(dia =>
            dia.tareas.filter(tarea => tarea.estado === "finalizado")
        );
        setTareasFinalizadas(tareasFinalizadas);
        const objetivosFinalizados = objetivosConEstado.filter(objetivo => objetivo.estado === "finalizado");
        setObjetivosFinalizados(objetivosFinalizados);

        setProcentajeSemana(
            ((objetivosFinalizados.length + tareasFinalizadas.length) / 
            (objetivosConEstado.length + tareasConEstado.flatMap(dia => dia.tareas).length)) * 100
        );
    }, [tareasConEstado, objetivosConEstado]);

    if (!planEstudio) {
        return <p>No se generó un plan de estudio.</p>;
    }

    const actualizarEstadoTareaEnBD = async (planId, diaIndex, tareaIndex, nuevoEstado, nuevaPrioridad) => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No estás autenticado. Por favor, inicia sesión.");
            }
    
            const token = await user.getIdToken();
    
            await axios.post(
                'http://localhost:5000/api/chat/actualizar-estado-tarea',
                { planId, diaIndex, tareaIndex, nuevoEstado, nuevaPrioridad },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
    
            console.log('Estado y/o prioridad de la tarea actualizados correctamente en la base de datos');
        } catch (error) {
            console.error('Error al actualizar el estado y/o prioridad en la base de datos:', error);
            throw new Error('Error al actualizar el estado y/o prioridad en la base de datos');
        }
    };

    const handleEstadoTareaChange = async (diaIndex, tareaIndex, nuevoEstado) => {
        try {
            setTareasConEstado((prevState) => {
                const newState = [...prevState];
                newState[diaIndex].tareas[tareaIndex].estado = nuevoEstado;
                return newState;
            });
    
            await actualizarEstadoTareaEnBD(planId, diaIndex, tareaIndex, nuevoEstado, null);
        } catch (error) {
            console.error('Error al actualizar el estado de la tarea:', error);
        }
    };
    
    const handlePrioridadTareaChange = async (diaIndex, tareaIndex, nuevaPrioridad) => {
        try {
            setTareasConEstado((prevState) => {
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
  
    const handleEstadoObjetivoChange = (objetivoIndex, nuevoEstado) => {
        const nuevosObjetivos = [...objetivosConEstado];
        nuevosObjetivos[objetivoIndex].estado = nuevoEstado;
        setObjetivosConEstado(nuevosObjetivos);
    };

    const handleEstadoTablaObjetivoChange = (e) => {
        setEstadoTablaObjetivo(e.target.value);
    };

    const totalTareas = planEstudio.planEstudio.reduce((total, dia) => total + dia.tareas.length, 0);

    return (
        <article className='flex flex-col items-center justify-center gap-60 text-white'>
            <section className='flex flex-col items-center justify-center'>
                <h1 className='text-4xl'>{planEstudio.campoEstudio}</h1>
                <img className="w-36" src={planEstudio.campoEstudio === "Poker Texas Holdem" ? "/imagenes/cartas-de-poquer.png" : planEstudio.campoEstudio === "Ajedrez" ? "/imagenes/ajedrez.png" : null} alt="" />
                <button onClick={porcentajeSemana === 100 ? handlePrograsarPlan : null} className='bg-black p-1 rounded-lg'>Avanzar</button>
            </section>
            <section className='flex flex-row items-center justify-center gap-10'>
                <div className='flex flex-col items-center justify-center'>
                    <p className='mb-5 text-xl'>Semana terminada</p>
                    <div className='w-32 h-32'>
                        <CircularProgressbar
                            value={porcentajeSemana || 0}
                            text={`${(porcentajeSemana || 0).toFixed(2)}%`}
                            styles={buildStyles({
                                textColor: "white",
                                pathColor: "black",
                                trailColor: "#D6D6D6",
                                textSize: "16px",
                            })}
                        />
                    </div>
                </div>
                <div className='flex flex-col items-center justify-center'>
                    <p className='mb-5 text-xl'>Tareas terminadas</p>
                    <div className='w-32 h-32'>
                        <CircularProgressbar
                            value={(tareasFinalizadas.length / totalTareas) * 100}
                            text={`${tareasFinalizadas.length}/${totalTareas}`}
                            styles={buildStyles({
                                textColor: "white",
                                pathColor: "black",
                                trailColor: "#D6D6D6",
                                textSize: "18px",
                                textAnchor: "middle",
                                dominantBaseline: "middle",
                            })}
                        />
                    </div>
                </div>
                <div className='flex flex-col items-center justify-center'>
                    <p className='mb-5 text-xl'>Objetivos terminados</p>
                    <div className='w-32 h-32'>
                        <CircularProgressbar
                            value={(objetivosFinalizados.length / objetivosConEstado.length) * 100}
                            text={`${objetivosFinalizados.length}/${objetivosConEstado.length}`}
                            styles={buildStyles({
                                textColor: "white",
                                pathColor: "black",
                                trailColor: "#D6D6D6",
                                textSize: "16px",
                                textAlignment: "middle",
                            })}
                        />
                    </div>
                </div>
            </section>
            <section className="flex flex-col items-center justify-center">
                <h3 className="text-2xl">Tareas</h3>
                <div className='flex flex-row items-center justify-center gap-10 mt-10'>
                    <div className='flex flex-col items-center justify-center '>
                        <h4>Estado</h4>
                        <select
                            onChange={handleEstadoTablaChange}
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
                    <div>
                        <h4>Prioridad</h4>
                        <select
                            onChange={handlePrioridadTablaChange}
                            className="style-input w-max"
                            name="prioridad"
                            id="prioridad"
                        >
                            <option value="todas">Todas</option>
                            <option value="baja">Baja</option>
                            <option value="media">Media</option>
                            <option value="alta">Alta</option>
                        </select>
                    </div>
                </div>

                <table className="border-separate border-spacing-4 w-full">
                    <thead className="text-lg">
                        <tr className="border-t border-black">
                            <th className="px-4 py-2 border-b border-black">Día</th>
                            <th className="px-4 py-2 border-b border-black">Titulo</th>
                            <th className="px-4 py-2 border-b border-black">Descripción</th>
                            <th className="px-4 py-2 border-b border-black">Estado</th>
                            <th className="px-4 py-2 border-b border-black">Prioridad</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tareasConEstado.map((diaEstudio, diaIndex) =>
                            diaEstudio.tareas
                                .filter((tarea) => (estadoTabla === "todas" || tarea.estado === estadoTabla) && (prioridadTabla === "todas" || tarea.prioridad === prioridadTabla))
                                .map((tarea, tareaIndex) => (
                                    <tr className="border-t border-b border-black" key={`${diaIndex}-${tareaIndex}`}>
                                        <td className="px-4 py-2 border-t border-b border-black">{diaEstudio.dia}</td>
                                        <td className="px-4 py-2 border-t border-b border-black">{tarea.titulo}</td>
                                        <td className="px-4 py-2 border-t border-b border-black">{tarea.contenido}</td>
                                        <td className="px-4 py-2 border-t border-b border-black">
                                            <select
                                                value={tarea.estado}
                                                onChange={(e) => handleEstadoTareaChange(diaIndex, tareaIndex, e.target.value)}
                                            >
                                                <option value="esperando">Esperando</option>
                                                <option value="enProgreso">En progreso</option>
                                                <option value="finalizado">Finalizado</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-2 border-t border-b border-black">
                                            <select
                                                value={tarea.prioridad}
                                                onChange={(e) => handlePrioridadTareaChange(diaIndex, tareaIndex, e.target.value)}
                                            >
                                                <option value="baja">Baja</option>
                                                <option value="media">Media</option>
                                                <option value="alta">Alta</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                        )}
                    </tbody>
                </table>
            </section>
            <section className="flex flex-col items-center justify-center">
                <h3 className="text-2xl">Objetivos</h3>
                <select
                    onChange={handleEstadoTablaObjetivoChange}
                    className="style-input w-max"
                    name="estado"
                    id="estado"
                >
                    <option value="esperando">Esperando</option>
                    <option value="enProgreso">En progreso</option>
                    <option value="finalizado">Finalizado</option>
                    <option value="todas">Todas</option>
                </select>

                <table className="table-auto border-separate border-spacing-4 w-full">
                    <thead className="text-lg">
                        <tr className="border-t border-b border-black">
                            <th className="px-4 py-2 border-b border-black">Titulo</th>
                            <th className="px-4 py-2 border-b border-black">Descripción</th>
                            <th className="px-4 py-2 border-b border-black">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {objetivosConEstado
                            .filter(
                                (objetivo) =>
                                    estadoTablaObjetivo === "todas" || objetivo.estado === estadoTablaObjetivo
                            )
                            .map((objetivo, objetivoIndex) => (
                                <tr className="border-t border-b border-black" key={objetivo.id || objetivoIndex}>
                                    <td className="px-4 py-2 border-t border-b border-black">{objetivo.titulo}</td>
                                    <td className="px-4 py-2 border-t border-b border-black">{objetivo.descripcion}</td>
                                    <td className="px-4 py-2 border-t border-b border-black">
                                        <select
                                            value={objetivo.estado}
                                            className="style-input"
                                            onChange={(e) => handleEstadoObjetivoChange(objetivoIndex, e.target.value)}
                                        >
                                            <option value="esperando">Esperando</option>
                                            <option value="enProgreso">En progreso</option>
                                            <option value="finalizado">Finalizado</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </section>
        </article>
    );
}

export default InformacionCampo;