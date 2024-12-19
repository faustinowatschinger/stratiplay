import { useLocation } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import React, { useState, useEffect } from 'react';
import { getAuth } from "firebase/auth";

function InformacionCampo() {
    const location = useLocation();
    const { planEstudio } = location.state || {};
    const [tareasFinalizadas, setTareasFinalizadas] = useState([]);
    const [objetivosFinalizados, setObjetivosFinalizados] = useState([]);
    const [tareasConEstado, setTareasConEstado] = useState([]);
    const [objetivosConEstado, setObjetivosConEstado] = useState([]);
    const [estadoTabla, setEstadoTabla] = useState("esperando");
    const [estadoTablaObjetivo, setEstadoTablaObjetivo] = useState("esperando");
    const [porcentajeSemana, setProcentajeSemana] = useState();

    // Inicializar tareas y objetivos con un estado predeterminado
    useEffect(() => {
        if (planEstudio && Array.isArray(planEstudio.planEstudio) && Array.isArray(planEstudio.objetivos)) {
            const tareasInicializadas = planEstudio.planEstudio.map((dia) => ({
                ...dia,
                tareas: dia.tareas?.map((tarea) => ({
                    ...tarea,
                    estado: tarea.estado || "esperando",
                })) || [],
            }));
            setTareasConEstado(tareasInicializadas);
    
            const objetivosInicializados = planEstudio.objetivos.map((objetivo) => ({
                ...objetivo,
                estado: objetivo.estado || "esperando",
            }));
            setObjetivosConEstado(objetivosInicializados);
        }
    }, [planEstudio]);
    

    // Actualizar tareas finalizadas dinámicamente
    useEffect(() => {
        const tareasFinalizadas = tareasConEstado.flatMap(dia =>
            dia.tareas.filter(tarea => tarea.estado === "finalizado")
        );
        setTareasFinalizadas(tareasFinalizadas);
        const objetivosFinalizados = objetivosConEstado.filter(objetivo => objetivo.estado === "finalizado");
        setObjetivosFinalizados(objetivosFinalizados)

        setProcentajeSemana(
            ((objetivosFinalizados.length + tareasFinalizadas.length) / 
            (objetivosConEstado.length + tareasConEstado.flatMap(dia => dia.tareas).length)) * 100
        );
        

    }, [tareasConEstado, objetivosConEstado]);

    if (!planEstudio) {
        return <p>No se generó un plan de estudio.</p>;
    }

    const handleEstadoTareaChange = async (diaIndex, tareaIndex, nuevoEstado) => {
      try {
          const nuevasTareas = [...tareasConEstado];
          nuevasTareas[diaIndex].tareas[tareaIndex].estado = nuevoEstado;
          setTareasConEstado(nuevasTareas);
  
          // Enviar actualización al backend
          const tareaId = planEstudio.planEstudio[diaIndex].tareas[tareaIndex].id; // Suponiendo que cada tarea tiene un `id` único
          const planId = planEstudio.planId; // ID del plan de estudio
  
          await actualizarEstadoTareaEnBD(planId, tareaId, nuevoEstado);
      } catch (error) {
          console.error('Error al cambiar el estado de la tarea:', error.message);
      }
  };
  
  
  

    const handleEstadoObjetivoChange = (objetivoIndex, nuevoEstado) => {
        const nuevosObjetivos = [...objetivosConEstado];
        nuevosObjetivos[objetivoIndex].estado = nuevoEstado;
        setObjetivosConEstado(nuevosObjetivos);
    };

    const handleEstadoTablaChange = (e) => {
        setEstadoTabla(e.target.value);
    };
    const handleEstadoTablaObjetivoChange = (e) => {
        setEstadoTablaObjetivo(e.target.value);
    };

    const handlePrograsarPlan = () => {
        alert("progresar")
    }

    // Calcular el porcentaje de tareas completadas
    const totalTareas = planEstudio.planEstudio.reduce((total, dia) => total + dia.tareas.length, 0);

    const actualizarEstadoTareaEnBD = async (planId, tareaId, nuevoEstado) => {
      try {
          const response = await fetch('http://localhost:5000/api/chat/actualizar-estado-tarea', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${getAuth().currentUser?.getIdToken()}`, // Token del usuario
              },
              body: JSON.stringify({ planId, tareaId, nuevoEstado }),
          });
  
          if (!response.ok) {
              throw new Error('Error al actualizar el estado en la base de datos');
          }
  
          console.log('Estado actualizado correctamente en la base de datos.');
      } catch (error) {
          console.error('Error al actualizar el estado en la base de datos:', error.message);
      }
  };
  
    
    
  

    return (
        <article className='flex flex-col items-center justify-center gap-60 text-white'>
            <section className='flex flex-col items-center justify-center'>
            <h1 className='text-4xl'>{planEstudio.campoEstudio}</h1>
            <p>{planEstudio.planEstudio.descripcion}</p>
            <button onClick={porcentajeSemana === 100 ? handlePrograsarPlan : null} className='bg-black p-1 rounded-lg'>Avanzar</button>
            </section>
            <section className='flex flex-row items-center justify-center gap-10'>
                <div className='flex flex-col items-center justify-center'>
                    <p className='mb-5 text-xl'>Semana terminada</p>
                    <div className='w-32 h-32'>
                    <CircularProgressbar
    value={porcentajeSemana || 0} // Usa 0 si porcentajeSemana es undefined
    text={`${(porcentajeSemana || 0).toFixed(2)}%`} // Asegúrate de evitar errores con undefined
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
                                textSize: "18px",  // Ajuste más preciso del tamaño del texto
                                textAnchor: "middle",  // Asegura que el texto se centre horizontalmente
                                dominantBaseline: "middle",  // Asegura que el texto se centre verticalmente
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
                                textSize: "16px",  // Ajustar el tamaño del texto
                                textAlignment: "middle",  // Asegura que el texto esté centrado
                            })}
                        />
                    </div>
                </div>
            </section>
            <section className=' flex flex-col items-center justify-center'>
                <h3 className='text-xl mb-5'>Temas a estudiar</h3>
                <table className="border-spacing border-spacing-x-4 border-collapse">
                    <thead className="text-lg">
                        <tr className="border-t border-black">
                            <th className="px-4 py-2">Tema</th>
                            <th className="px-4 py-2">Contenido</th>
                        </tr>
                    </thead>
                    <tbody>
                        {planEstudio.planEstudio.map((diaEstudio, index) => (
                            <React.Fragment key={index}>
                                {/* Encabezado para cada día */}
                                <tr className="border-b border-black">
                                    <td  colSpan="3" className="px-4 py-2 font-bold text-center">
                                        <h4>{diaEstudio.dia}</h4>
                                        <p>{diaEstudio.descripcion}</p>
                                    </td>
                                </tr>
                                {diaEstudio.temas?.map((tema, temaIndex) => (
    <tr key={`${index}-${temaIndex}`} className="border-b border-t border-black">
        <td className="px-4 py-2">{tema}</td>
        <td className="px-4 py-2">
            {diaEstudio.contenido?.[temaIndex] ? (
                <p target="_blank" rel="noopener noreferrer">
                    {diaEstudio.contenido[temaIndex]}
                </p>
            ) : (
                <span>Sin contenido</span>
            )}
        </td>
    </tr>
))}

                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </section>
            {/* Renderizando las tareas */}
            <section className="flex flex-col items-center justify-center">
  <h3 className="text-xl">Tareas</h3>
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

  <table className="border-separate border-spacing-4 w-full">
    <thead className="text-lg">
      <tr className="border-t border-black">
        <th className="px-4 py-2 border-b border-black">Día</th>
        <th className="px-4 py-2 border-b border-black">Tarea</th>
        <th className="px-4 py-2 border-b border-black">Descripción</th>
        <th className="px-4 py-2 border-b border-black">Estado</th>
      </tr>
    </thead>
    <tbody>
      {tareasConEstado.map((diaEstudio, diaIndex) =>
        diaEstudio.tareas
          .filter((tarea) => estadoTabla === "todas" || tarea.estado === estadoTabla)
          .map((tarea, tareaIndex) => (
            <tr className="border-t border-b border-black" key={`${diaIndex}-${tareaIndex}`}>
              <td className="px-4 py-2 border-t border-b border-black">{diaEstudio.dia}</td>
              <td className="px-4 py-2 border-t border-b border-black">{tarea.titulo}</td>
              <td className="px-4 py-2 border-t border-b border-black">{tarea.descripcion}</td>
              <td className="px-4 py-2 border-t border-b border-black">
                <select
                  value={tarea.estado}
                  className="style-input"
                  onChange={(e) =>
                    handleEstadoTareaChange(diaIndex, tareaIndex, e.target.value)
                  }
                >
                  <option value="esperando">Esperando</option>
                  <option value="enProgreso">En progreso</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </td>
            </tr>
          ))
      )}
    </tbody>
  </table>
</section>

            {/* Renderizando los objetivos */}
            <section className="flex flex-col items-center justify-center">
  <h3 className="text-xl">Objetivos</h3>
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

  <table className="table-auto border-separate border-spacing-4 w-full">
    <thead className="text-lg">
      <tr className="border-t border-b border-black">
        <th className="px-4 py-2 border-b border-black">Nombre</th>
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