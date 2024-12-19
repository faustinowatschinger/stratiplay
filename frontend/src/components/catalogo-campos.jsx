import React, { useContext } from "react";
import { TemasContext } from "./context/temasContext";
import { Link, useNavigate } from "react-router-dom";

function Catalogo() {
    const { temas, loading, error, eliminarPlan } = useContext(TemasContext);
    const navigate = useNavigate();

    if (loading) return <p>Cargando temas...</p>;
    if (error) return <p>{error}</p>;

    return (
        <article className="flex flex-col items-center justify-center p-10 gap-5">
            <div>
                <Link to="/agregar-campo">
                    <img className="w-16" src="../../../public/imagenes/mas.png" alt="mas" />
                </Link>
            </div>
            <div className="flex flex-wrap gap-8 items-center justify-center">
                {temas.map((tema) => (
                    <div
                        key={tema.id}  // Usamos tema.id aquí
                        className="flex flex-col bg-black text-white p-5 gap-3 rounded-xl items-center justify-center"
                    >
                        <h3 className="text-xl">{tema.campoEstudio || "Subcampo no especificado"}</h3>
                        <p>{tema.planEstudio?.descripcion || "Descripción no especificada"}</p>
                        <div className="flex flex-row gap-2">
                        <button
                            className="bg-white text-black p-1 rounded-lg"
                            onClick={() => navigate("/informacion-campo", { state: { planEstudio: tema } })}
                        >
                            Estudiar
                        </button>
                        <button
                            className="bg-white text-black p-1 rounded-lg"
                            onClick={() => eliminarPlan(tema.id)}  // Pasamos tema.id para eliminar
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
