import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useUserPlan } from '../context/userPlanContext';

function AgregarCampo() {
    const navigate = useNavigate();
    const { userPlan, loading: loadingUserPlan } = useUserPlan();
    const [informacionTema, setInformacionTema] = useState({
        campo: "",
        nivelIntensidad: "",
        diasEstudio: [],
        horasEstudio: {}, // Nuevo estado para las horas de estudio
        elo: "",
        tiempo: "",
        experienciaAjedrez: "Sin experiencia",
        conocimientosAjedrez: "",
        tipoPoker: "",
        limiteMesa: "",
        conocimientosPoker: "",
    });

    const [planEstudio, setPlanEstudio] = useState("");
    const [loading, setLoading] = useState(false);
    const [camposEstudiados, setCamposEstudiados] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCamposEstudiados = async () => {
            try {
                const user = auth.currentUser;
                if (!user) {
                    throw new Error("No estás autenticado. Por favor, inicia sesión.");
                }

                const token = await user.getIdToken();
                const response = await axios.get('https://api.stratiplay.com/api/chat/campos-estudiados', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setCamposEstudiados(response.data);
            } catch (error) {
                console.error('Error al obtener los campos estudiados:', error);
            }
        };

        fetchCamposEstudiados();
    }, []);

    useEffect(() => {
        if (!loadingUserPlan) {
            const maxPlanes = userPlan === 'pro' ? 4 : userPlan === 'basic' ? 2 : 1;
            if (camposEstudiados.length >= maxPlanes) {
                if (userPlan === 'basic') {
                    setError(<h3>No puedes agregar más planes de estudio. Tu plan actual ({userPlan}) permite un máximo de {maxPlanes} planes. Si quieres agreagar mas planes de estudio aumenta tu plan a Pro.</h3>);
                }
                else if (userPlan === 'pro') {
                    setError(<h3>No puedes agregar más planes de estudio. Tu plan actual ({userPlan}) permite un máximo de {maxPlanes} planes.</h3>);
                }
                else {
                    setError(<h3>No puedes agregar más planes de estudio. Tu plan actual ({userPlan}) permite un máximo de {maxPlanes} plan. Si quieres agreagar mas planes de estudio aumenta tu plan.</h3>);
                }
            }
        }
    }, [loadingUserPlan, camposEstudiados, userPlan]);

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

    const handleHorasEstudioChange = (e, dia) => {
        const { value } = e.target;
        setInformacionTema((prevState) => ({
            ...prevState,
            horasEstudio: {
                ...prevState.horasEstudio,
                [dia]: value,
            },
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

            const token = await user.getIdToken();

            // Validar que los campos obligatorios no estén vacíos
            if (!informacionTema.campo || !informacionTema.nivelIntensidad) {
                throw new Error("Campos obligatorios faltantes: campo y nivelIntensidad.");
            }

            let datosEnviar = { ...informacionTema };
            if (informacionTema.campo === "Ajedrez") {
                datosEnviar = {
                    ...datosEnviar,
                    elo: informacionTema.elo,
                    tiempo: informacionTema.tiempo,
                    experienciaAjedrez: informacionTema.experienciaAjedrez,
                    conocimientosAjedrez: informacionTema.conocimientosAjedrez,
                };
            } else if (informacionTema.campo === "Poker Texas Holdem") {
                datosEnviar = {
                    ...datosEnviar,
                    tipoPoker: informacionTema.tipoPoker,
                    limiteMesa: informacionTema.limiteMesa,
                    conocimientosPoker: informacionTema.conocimientosPoker,
                };
            }

            console.log('Datos enviados:', { informacionTema: datosEnviar });

            const response = await axios.post(
                'https://api.stratiplay.com/api/chat/custom-prompt',
                { informacionTema: datosEnviar },
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
            console.error('Error al generar el plan de estudio:', error);
            setPlanEstudio("Ocurrió un error al generar tu plan de estudio. Por favor, intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const camposDisponibles = ["Ajedrez", "Poker Texas Holdem"].filter(campo => !camposEstudiados.includes(campo));

    if (loadingUserPlan || loading) {
        return <div className="w-20 h-20 border-4 border-white m-auto border-t-black rounded-full animate-spin"></div>;
    }

    if (error) {
        return <div className="text-red-500 text-center">{error}</div>;
    }

    return (
        <div className="flex justify-center items-center h-screen">
            <form
                onSubmit={handleSubmit}
                className="flex flex-col w-max m-auto items-center justify-center text-white bg-[#4D4D4D] p-3 rounded-lg space-y-5 text-xl"
            >
                <div className='flex flex-col items-center justify-center w-full'>
                    <label className='text-2xl' htmlFor="campo">¿Qué Juego de Estrategia quieres Aprender?</label>
                    <select
                        className="style-input w-full"
                        id="campo"
                        value={informacionTema.campo}
                        onChange={handleInputChange}
                    >
                        <option value="">Selecciona un campo</option>
                        {camposDisponibles.map(campo => (
                            <option key={campo} value={campo}>{campo}</option>
                        ))}
                    </select>
                </div>

                {informacionTema.campo === "Ajedrez" && (
                    <div className='flex flex-col items-center justify-center w-full'>
                        <label className='text-2xl' htmlFor="experienciaAjedrez">¿Cual es tu Elo?</label>
                        <select 
                            id="experienciaAjedrez"
                            className="style-input"
                            value={informacionTema.experienciaAjedrez}
                            onChange={handleInputChange}
                        >
                            <option value="No tengo elo">No tengo elo</option>
                            <option value="Elo online">Elo online</option>
                            <option value="Elo fide">Elo fide</option>
                        </select>
                    </div>
                )}

                {(informacionTema.campo === "Ajedrez" && (informacionTema.experienciaAjedrez === "Elo online" || informacionTema.experienciaAjedrez === "Elo fide")) && (
                    <div className='flex flex-col items-center justify-center w-full'>
                        <div className='flex flex-col items-center justify-center w-full'>
                            <label className='text-2xl' htmlFor="elo">¿Cuanto elo tienes?</label>
                            <input 
                                type="number"
                                id='elo'
                                className='text-start'
                                value={informacionTema.elo}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className='flex flex-col items-center justify-center w-full'>
                            <label className='text-2xl' htmlFor="tiempo">¿A cuanto tiempo juegas?</label>
                            <select 
                            id="tiempo"
                            className="style-input"
                            value={informacionTema.tiempo}
                            onChange={handleInputChange}>
                                <option value="">Selecciona un tiempo</option>
                                <option value="bala">Bala</option>
                                <option value="blitz">Blitz</option>
                                <option value="rapida">Rapida</option>
                                <option value="clásica">Clásica</option>
                            </select>
                        </div>
                        <div className='flex flex-col items-center justify-center w-full'>
                            <label className='text-2xl' htmlFor="conocimientosAjedrez">¿Que conocimientos tienes?</label>
                            <textarea 
                                id="conocimientosAjedrez"  
                                rows="5" 
                                className="style-input"
                                placeholder='Ej: Aperturas, medio juego, finales, táctica, estrategia, etc.'
                                value={informacionTema.conocimientosAjedrez}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                )}

                {informacionTema.campo === "Poker Texas Holdem" && (
                    <div className='flex flex-col items-center justify-center w-full'>
                        <div className='flex flex-col items-center justify-center w-full'>
                        <label className='text-2xl' htmlFor="tipoPoker">¿Qué tipo de Poker te interesa?</label>
                        <select 
                            id="tipoPoker"
                            className="style-input"
                            value={informacionTema.tipoPoker}
                            onChange={handleInputChange}
                        >
                            <option value="">Selecciona un tipo</option>
                            <option value="Cash games">Cash games</option>
                            <option value="Torneos">Torneos</option>
                            <option value="Sit and Go">Sit and Go</option>
                        </select>
                    </div>
                    <div className='flex flex-col items-center justify-center w-full'>
                        <label htmlFor="limiteMesa">¿En que mesas juegas?</label>
                        <select 
                        id="limiteMesa"
                        className='style-input '
                        value={informacionTema.limiteMesa}
                        onChange={handleInputChange}>
                            <option value="Micro-stakes">Micro-stakes(NL2-NL25)</option>
                            <option value="Low-stakes">Low-stakes(NL50-NL200)</option>
                            <option value="Mid-stakes">Mid-stakes(NL400-NL2000)</option>
                            <option value="High-stakes">High-stakes(NL5000+)</option>
                        </select>
                    </div>
                    <div className='flex flex-col items-center justify-center w-full'>
                            <label className='text-2xl' htmlFor="conocimientosPoker">¿Que conocimientos tienes?</label>
                            <textarea 
                                id="conocimientosPoker"  
                                rows="5" 
                                className="style-input"
                                placeholder='Ej: Juego preflop, juego postflop, probabilidades, estrategias avanzadas, etc.'
                                value={informacionTema.conocimientosPoker}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                )}
                <div className='flex flex-col items-center justify-center w-full'>
                    <label className='text-2xl' htmlFor="nivelIntensidad">¿Que nivel de intensidad quieres el plan?</label>
                    <select 
                    id="nivelIntensidad"
                    className='style-input' 
                    value={informacionTema.nivelIntensidad}
                    onChange={handleInputChange}>
                        <option value="">Selecciona un nivel</option>
                        <option value="bajo">Bajo</option>
                        <option value="alto">Alto</option>
                    </select>
                </div>
                <div className='flex flex-col items-center justify-center w-full'>
    <label className='text-2xl'>¿Qué días a la semana vas a estudiar?</label>
    <div className="flex flex-wrap gap-4 items-center">
        {["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"].map(
            (dia) => (
                <div key={dia} className="flex flex-col items-center">
                    <label className="flex items-center flex-row">
                        {dia.charAt(0).toUpperCase() + dia.slice(1)}
                        <input
                            className='w-5'
                            type="checkbox"
                            value={dia}
                            checked={informacionTema.diasEstudio.includes(dia)}
                            onChange={handleCheckboxChange}
                        />
                    </label>
                    {informacionTema.diasEstudio.includes(dia) && (
                        <div className="inline-flex mt-2">
                            <input
                                type="number"
                                placeholder="hs"
                                className="style-input w-20 p-1 text-center"
                                value={informacionTema.horasEstudio[dia] || ""}
                                onChange={(e) => handleHorasEstudioChange(e, dia)}
                            />
                        </div>
                    )}
                </div>
            )
        )}
    </div>
</div>

                <button className="mt-4 text-base md:text-lg bg-[#252525] text-white py-2 px-4 rounded-lg shadow-md hover:bg-[#1a1a1a] transition duration-300" type="submit" disabled={loading}>
                    {loading ? "Generando..." : "Agregar"}
                </button>
            </form>
        </div>
    );
}
export default AgregarCampo;