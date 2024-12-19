import { useState } from 'react';
import axios from 'axios';
import { auth } from './firebase';

function AgregarCampo() {

    const [informacionTema, setInformacionTema] = useState({
        campo: "",
        nivelExperiencia: "sinExperiencia",
        descripcionExperiencia: "",
        nivelIntensidad: "",
        diasEstudio: [],
        subCampo: "", // Nueva propiedad para área de programación
    });

    const [planEstudio, setPlanEstudio] = useState(""); // Estado para el plan de estudio
    const [loading, setLoading] = useState(false); // Estado para el indicador de carga

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setInformacionTema((prevState) => ({
            ...prevState,
            [id]: value,
        }));
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setInformacionTema((prevState) => ({
            ...prevState,
            diasEstudio: checked
                ? [...prevState.diasEstudio, value]
                : prevState.diasEstudio.filter((dia) => dia !== value),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        try {
            const user = auth.currentUser;
    
            if (!user) {
                throw new Error("No estás autenticado. Por favor, inicia sesión.");
            }
    
            const token = await user.getIdToken(); // Obtén el token de autenticación

            // Asegúrate de que los campos requeridos tengan valores predeterminados
            const datosEnviar = {
                ...informacionTema,
                nivelIntensidad: informacionTema.nivelIntensidad || "bajo",
                diasEstudio: informacionTema.diasEstudio.length > 0 ? informacionTema.diasEstudio : ["lunes"],
                subCampo: informacionTema.subCampo || "No especificado",
                descripcionExperiencia: informacionTema.descripcionExperiencia || "No especificado",
                tiempoSemana: informacionTema.nivelIntensidad || "bajo", // Agrega el campo tiempoSemana
            };

            // Log the data being sent
            console.log('Datos enviados:', { informacionTema: datosEnviar });
    
            const response = await axios.post(
                'http://localhost:5000/api/chat/custom-prompt',
                { informacionTema: datosEnviar },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Agrega el token en el encabezado
                    },
                }
            );
    
            setPlanEstudio(response.data);
            window.location.href = "/catalogo-campos"; // Redirige y recarga la página
        } catch (error) {
            console.error('Error al generar el plan de estudio:', error);
            setPlanEstudio("Ocurrió un error al generar tu plan de estudio. Por favor, intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <form
                onSubmit={handleSubmit}
                className="flex flex-col w-1/4 m-auto text-white space-y-5 text-xl"
            >
                <div>
                    <label className='text-2xl' htmlFor="campo">¿Qué habilidad quieres aprender para el desarrollo de tu SaaS?</label>
                    <select
                        className="style-input w-full"
                        id="campo"
                        value={informacionTema.campo}
                        onChange={handleInputChange}
                    >
                        <option value="">Selecciona un campo</option>
                        <option value="Arquitectura de Software">Arquitectura de Software</option>
                        <option value="Programacion Frontend">Programacion Frontend</option>
                        <option value="Programacion Backend">Programacion Backend</option>
                        <option value="Gestion de Productos SaaS">Gestion de Productos SaaS</option>
                        <option value="DevOps y Despliegue">DevOps y Despliegue</option>
                        <option value="Autenticación y Seguridad">Autenticación y Seguridad </option>
                        <option value="Monetización y Estrategias de Precios">Monetización y Estrategias de Precios</option>
                        <option value="Marketing para SaaS">Marketing para SaaS</option>
                        <option value="Soporte y Atención al Cliente">Soporte y Atención al Cliente</option>
                        <option value="Análisis de la Competencia y Posicionamiento">Análisis de la Competencia y Posicionamiento</option>
                        <option value="Mantenimiento y Actualizaciones">Mantenimiento y Actualizaciones</option>
                    </select>
                </div>
                <div className="flex flex-col">
                    <label className='text-2xl' htmlFor="nivelExperiencia">
                        ¿Qué experiencia tienes del campo?
                    </label>
                    <select
                        className="style-input"
                        id="nivelExperiencia"
                        value={informacionTema.nivelExperiencia}
                        onChange={handleInputChange}
                    >
                        <option value="Sin experiencia">Sin experiencia</option>
                        <option value="Con experiencia">Con experiencia</option>
                    </select>
                </div>

                {informacionTema.nivelExperiencia === "Con experiencia" && (
                    <div>
                        <label className='text-2xl' htmlFor="descripcionExperiencia">Especifica tu experiencia</label>
                        <textarea
                            className="style-input bg-black text-white w-full"
                            type="text"
                            id="descripcionExperiencia"
                            value={informacionTema.descripcionExperiencia}
                            onChange={handleInputChange}
                            placeholder="Se lo mas descriptivo posible para una mejor experiencia..."
                        />
                    </div>
                )}
                <div>
                    <label className='text-2xl' htmlFor="nivelIntensidad">¿Que nivel de intensidad quieres en el plan?</label>
                    <select 
                    id="nivelIntensidad"
                    className='style-input w-full' 
                    value={informacionTema.nivelIntensidad}
                    onChange={handleInputChange}>
                        <option value="bajo">Bajo</option>
                        <option value="alto">Alto</option>
                    </select>
                </div>
                <div>
                    <label className='text-2xl'>¿Qué días a la semana vas a estudiar?</label>
                    <div className="flex flex-wrap gap-4 items-center">
                        {["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"].map(
                            (dia) => (
                                <label key={dia} className="flex items-center flex-row">
                                    {dia.charAt(0).toUpperCase() + dia.slice(1)}
                                    <input
                                        className='w-5'
                                        type="checkbox"
                                        value={dia}
                                        checked={informacionTema.diasEstudio.includes(dia)}
                                        onChange={handleCheckboxChange}
                                    />
                                </label>
                            )
                        )}
                    </div>
                </div>

                <button className="bg-black w-max p-2 rounded-lg mt-4 m-auto" type="submit" disabled={loading}>
                    {loading ? "Generando..." : "Agregar"}
                </button>
            </form>
        </div>
    );
}
export default AgregarCampo;