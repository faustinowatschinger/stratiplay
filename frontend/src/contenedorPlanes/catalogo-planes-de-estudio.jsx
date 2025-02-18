import React, { useContext, useState } from "react";
import { TemasContext } from "../context/temasContext";
import { Link, useNavigate } from "react-router-dom";

function Catalogo() {
    const { temas, loading, error, eliminarPlan } = useContext(TemasContext);
    const navigate = useNavigate();
    const [eliminando, setEliminando] = useState(false); // Cambié a useState

    const handleEliminar = async (id) => {
        setEliminando(true);
        await eliminarPlan(id);
        setEliminando(false);
    };

    if (loading || eliminando) return <div className="w-20 h-20 border-4 border-white m-auto border-t-black rounded-full animate-spin"></div>;
    if (error) return <p>{error}</p>;

    return (
        <article className="flex flex-col items-center justify-center p-10 gap-5">
            <div>
                <Link to="/agregar-plan-de-estudio">
                    <img className="w-16" src="/imagenes/mas.webp" alt="mas" />
                </Link>
            </div>
            <div className="flex flex-wrap gap-8 items-center justify-center">
                {temas.map((tema) => (
                    <div
                        key={tema.id}  // Usamos tema.id aquí
                        className="flex flex-col bg-[#4D4D4D] text-white p-5 gap-3 rounded-xl items-center justify-center"
                    >
                        <h3 className="text-xl bg-[#252525] w-full items-center p-1 justify-center flex flex-col rounded-lg">{tema.campo || "Subcampo no especificado"}</h3>
                        <img className="w-36" src={tema.campo === "Poker Texas Holdem" ? "/imagenes/cartas-de-poquer.webp" : tema.campo === "Ajedrez" ? "/imagenes/ajedrez.webp" : null} alt="" />
                        <div className="flex flex-row gap-2">
                            <button
                                className="bg-[#252525] text-white p-1 rounded-lg"
                                onClick={() => navigate("/informacion-plan-de-estudio", { state: { planId: tema.id } })}
                            >
                                Estudiar
                            </button>
                            <button
                                className="bg-[#252525] text-white p-1 rounded-lg"
                                onClick={() => handleEliminar(tema.id)}  // Usamos handleEliminar
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </article>
    );
}

export default Catalogo;