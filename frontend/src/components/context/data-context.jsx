import React, { createContext, useContext, useState } from "react";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [tareas, setTareas] = useState([]);
    const [objetivos, setObjetivos] = useState([]);
    const [metricas, setMetricas] = useState({
        semanaTerminada: 0,
        tareasTerminadas: 0,
        totalTareas: 0,
    });

    return (
        <DataContext.Provider value={{ tareas, setTareas, objetivos, setObjetivos, metricas, setMetricas }}>
            {children}
        </DataContext.Provider>
    );
};

export const useDataContext = () => useContext(DataContext);
