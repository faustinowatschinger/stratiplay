import React, { createContext, useState, useEffect } from "react";
import { getFirestore, collection, getDocs, query, doc, deleteDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const TemasContext = createContext();

export function TemasProvider({ children }) {
    const [temas, setTemas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const auth = getAuth();
        const db = getFirestore();
    
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                const usuarioId = user.uid;
    
                const q = query(collection(db, "usuarios", usuarioId, "planesEstudio"));
                getDocs(q)
                    .then((querySnapshot) => {
                        const temasData = querySnapshot.docs.map((doc) => {
                            return { id: doc.id, ...doc.data() }; // Asegurarse de incluir el ID del documento
                        });
                        setTemas(temasData);
                        setLoading(false);
                    })
                    .catch((err) => {
                        console.error("Error obteniendo los temas:", err);
                        setError("Error al obtener los temas. Verifica los permisos.");
                        setLoading(false);
                    });
            } else {
                console.log("Usuario no autenticado");
                setLoading(false);
            }
        });
    
        return () => unsubscribe();
    }, []);

    // Función para eliminar un plan de estudio
    const eliminarPlan = async (planId) => {
        const auth = getAuth();
        const db = getFirestore();
        const user = auth.currentUser;

        if (user) {
            const userRef = doc(db, "usuarios", user.uid, "planesEstudio", planId);
            try {
                await deleteDoc(userRef);
                setTemas(temas.filter((tema) => tema.id !== planId));  // Actualizar el estado
                console.log("Plan de estudio eliminado exitosamente");
            } catch (error) {
                console.error("Error al eliminar el plan:", error);
            }
        }
    };

    return (
        <TemasContext.Provider value={{ temas, loading, error, eliminarPlan }}>
            {children}
        </TemasContext.Provider>
    );
}
