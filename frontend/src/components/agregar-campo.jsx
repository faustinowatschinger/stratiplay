import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';

function AgregarCampo() {

    const navigate = useNavigate();

    const [informacionTema, setInformacionTema] = useState({
        campo: "",
        nivelIntensidad: "",
        diasEstudio: [],
        elo: "",
        experienciaAjedrez: "Sin experiencia",
        tipoPoker: "",
        estiloJuego: "",
        pgnFile: null, // Cambiado a un solo archivo
        pokerHands: Array(10).fill(null),
        softwaresPoker: "No",
        limiteMesa: "",
    });

    const [planEstudio, setPlanEstudio] = useState("");
    const [loading, setLoading] = useState(false);
    const [camposEstudiados, setCamposEstudiados] = useState([]);

    useEffect(() => {
        const fetchCamposEstudiados = async () => {
            try {
                const user = auth.currentUser;
                if (!user) {
                    throw new Error("No estás autenticado. Por favor, inicia sesión.");
                }

                const token = await user.getIdToken();
                const response = await axios.get('http://localhost:5000/api/chat/campos-estudiados', {
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

    const handleFileChange = (e, fileType = 'pgnFile') => {
        const file = e.target.files[0];
        setInformacionTema((prevState) => ({
            ...prevState,
            [fileType]: file,
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
                    pgnFile: informacionTema.pgnFile,
                };
            } else if (informacionTema.campo === "Poker Texas Holdem") {
                datosEnviar = {
                    ...datosEnviar,
                    tipoPoker: informacionTema.tipoPoker,
                    pokerHands: informacionTema.pokerHands.filter(file => file !== null),
                    limiteMesa: informacionTema.limiteMesa,
                };
            }

            const formData = new FormData();
            formData.append('informacionTema', JSON.stringify(datosEnviar));
            if (datosEnviar.pgnFile) {
                formData.append('pgnFile', datosEnviar.pgnFile, datosEnviar.pgnFile.name);
            }
            datosEnviar.pokerHands.forEach((file, index) => {
                if (file) {
                    formData.append(`pokerHands[${index}]`, file, file.name);
                }
            });

            console.log('Datos enviados:', { informacionTema: datosEnviar });

            const response = await axios.post(
                'http://localhost:5000/api/chat/custom-prompt',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            setPlanEstudio(response.data);
            window.location.href = "/catalogo-campos";
        } catch (error) {
            console.error('Error al generar el plan de estudio:', error);
            setPlanEstudio("Ocurrió un error al generar tu plan de estudio. Por favor, intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const camposDisponibles = ["Ajedrez", "Poker Texas Holdem"].filter(campo => !camposEstudiados.includes(campo));

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
                                className='style-input'
                                value={informacionTema.elo}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className='flex flex-col items-center justify-center w-full'>
                            <label className='text-2xl' htmlFor="pgnFile">Sube tus últimas 10 partidas en formato PGN</label>
                                <input 
                                    type="file"
                                    id={`pgnFile`}
                                    className='style-input'
                                    accept=".pgn"
                                    onChange={(e) => handleFileChange(e, 'pgnFile')}
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
                        <label htmlFor="softwaresPoker">¿Tienes manos jugadas en algun software de poker?</label>
                        <select 
                        id="softwaresPoker"
                        className='style-input'
                        value={informacionTema.softwaresPoker}
                        onChange={handleInputChange}>
                            <option value="Si">Si</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                    {informacionTema.campo === "Poker Texas Holdem" && informacionTema.softwaresPoker === "Si" && (
                    <div className='flex flex-col items-center justify-center w-full'>
                        <label className='text-2xl' htmlFor="pokerHands">Sube tus 10 manos mas significantes en formato texto</label>
                        {[...Array(10)].map((_, index) => (
                            <input 
                                key={index}
                                type="file"
                                id={`pokerHand${index}`}
                                className='style-input w-full'
                                accept=".txt"
                                onChange={(e) => handleFileChange(e, 'pokerHands')}
                            />
                        ))}
                    </div>
                )}
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

                <button className="bg-[#252525] w-max p-2 rounded-lg mt-4 m-auto" type="submit" disabled={loading}>
                    {loading ? "Generando..." : "Agregar"}
                </button>
            </form>
        </div>
    );
}
export default AgregarCampo;