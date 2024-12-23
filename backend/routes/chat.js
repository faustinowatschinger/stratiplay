const express = require('express');
const axios = require('axios');
const admin = require('firebase-admin');
const winston = require('winston');
const router = express.Router();
require('dotenv').config();

// Inicialización de Firebase
const serviceAccount = require('../config/ordo-62889-firebase-adminsdk-zl2wb-dd93e17d22.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
const db = admin.firestore();

// Logger de errores
const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console({ format: winston.format.simple() })
    ]
});

const actualizarEstadoTarea = async (uid, planId, diaIndex, tareaIndex, nuevoEstado) => {
    try {
        const userRef = db.collection('usuarios').doc(uid);
        const planRef = userRef.collection('planesEstudio').doc(planId);
        const planDoc = await planRef.get();

        if (!planDoc.exists) {
            throw new Error('El plan de estudio no existe');
        }

        const planData = planDoc.data();
        planData.planEstudio[diaIndex].tareas[tareaIndex].estado = nuevoEstado;

        await planRef.update(planData);
        logger.info('Estado de la tarea actualizado exitosamente');
    } catch (error) {
        logger.error('Error al actualizar el estado de la tarea:', error);
        throw new Error('Error al actualizar el estado de la tarea');
    }
};

// Función para truncar el string
const truncateString = (str, maxLength) => {
    if (!str) return "";
    if (str.length <= maxLength) return str;
    const truncated = str.slice(0, maxLength).split(" ").slice(0, -1).join(" ");
    logger.warn("Prompt truncado:", truncated);
    return truncated + "...";
};

// Función para guardar los datos en Firestore
const guardarPlanEstudio = async (uid, planEstudio) => {
    try {
        const userRef = db.collection('usuarios').doc(uid);
        const planRef = userRef.collection('planesEstudio').doc();
        await planRef.set(planEstudio);
        logger.info('Plan de estudio guardado exitosamente en la subcolección del usuario');
    } catch (error) {
        logger.error('Error al guardar el plan de estudio en la subcolección:', error);
        throw new Error('Error al guardar el plan de estudio');
    }
};

router.post('/custom-prompt', async (req, res) => {
    const { informacionTema } = req.body;

    if (!informacionTema || !informacionTema.campo || !informacionTema.nivelIntensidad) {
        logger.error('Campos obligatorios faltantes: campo y nivelIntensidad.');
        return res.status(400).json({ error: 'Campos obligatorios faltantes: campo y nivelIntensidad.' });
    }

    let uid;
    try {
        const idToken = req.headers.authorization?.split(' ')[1];
        if (!idToken) {
            throw new Error('Token no proporcionado');
        }

        const decodedToken = await admin.auth().verifyIdToken(idToken);
        uid = decodedToken.uid;

        if (!uid) {
            throw new Error('El token no contiene un UID');
        }
    } catch (error) {
        logger.error('Error al verificar el token:', error.message);
        return res.status(401).json({ error: 'Autenticación fallida: ' + error.message });
    }

    try {
        let promptContent = `uid del usuario: ${uid}
        Campo a estudiar: ${informacionTema.campo}, 
        SubCampo a estudiar: ${informacionTema.subCampo || 'No especificado'},
        Nivel de experiencia: ${informacionTema.nivelExperiencia || 'No especificado'},
        Experiencia: ${informacionTema.descripcionExperiencia || 'No especificado'}, 
        Tiempo semanal: ${informacionTema.nivelIntensidad},
        Días de estudio: ${informacionTema.diasEstudio?.length > 0 ? informacionTema.diasEstudio.join(', ') : 'No especificado'},
        Necesito un plan de estudio detallado, incluyendo objetivos claros, un plan semanal con temas específicos y tareas diarias, todos los días seleccionados tienen que tener sus respectivas tareas sin excepción. Asegúrate de que los campos 'planEstudio', 'objetivos' contengan información detallada.`;

        // Agregar lógica condicional para modificar el promptContent
        if (informacionTema.campo === 'Ajedrez') {
            promptContent += `
            Elo: ${informacionTema.elo || 'No especificado'},
            Experiencia en Ajedrez: ${informacionTema.experienciaAjedrez || 'No especificado'},
            Archivos PGN: ${informacionTema.pgnFile ? informacionTema.pgnFile.name : 'No especificado'}
            Tienes que analizar detalladamente el archivo PGN donde se encuentran las últimas 10 partidas de ajedrez del usuario, basándote en esas partidas tienes que saber qué estilo de juego tiene, sus errores comunes, puntos fuertes, puntos débiles, etc.

            Fundamentos del Ajedrez:

Aperturas: Los jugadores deben aprender las aperturas básicas y sus principios (control del centro, desarrollo de piezas, seguridad del rey). El conocimiento de varias aperturas permitirá una mejor preparación para la fase de medio juego.
Tácticas: La resolución de problemas tácticos es esencial para mejorar la visión del tablero y el cálculo de combinaciones. Los temas incluyen pinzas, clavadas, doble ataque, jaque mate en varias jugadas, entre otros.
Finales: Los finales son cruciales para transformar una ventaja en una victoria. Los jugadores deben estudiar finales de rey y peón, finales básicos de piezas, y técnicas de conversión de ventaja material.
Métodos de Enseñanza y Estudio:

Plataformas de Estudio: Usar plataformas como Chess.com, Lichess y otras herramientas interactivas, donde se pueda practicar y analizar partidas.
Práctica Activa: Es importante jugar partidas regularmente, tanto rápidas como lentas, para poner en práctica lo aprendido.
Análisis de Partidas: Analizar partidas propias y ajenas es esencial. Utilizar motores de ajedrez como Stockfish para recibir retroalimentación sobre jugadas específicas.
Revisión de Grandes Maestros: Ver partidas de grandes maestros, entender sus planes y estrategias, y aprender de sus errores y aciertos.
Personalización del Estudio:

Ritmo de Estudio: Los jugadores deben establecer objetivos a corto y largo plazo. Es recomendable empezar con 15-30 minutos al día y aumentar la duración a medida que se avanza.
Evaluación Continua: Realizar autoevaluaciones periódicas para identificar fortalezas y debilidades, y ajustar el plan de estudio en consecuencia.`;
        } else if (informacionTema.campo === 'Poker Texas Holdem') {
            promptContent += `
            Tipo de Poker: ${informacionTema.tipoPoker || 'No especificado'},
            Manos de Poker: ${informacionTema.pokerHands ? informacionTema.pokerHands.filter(file => file !== null).map(file => file.name).join(', ') : 'No especificado'},
            Límite de mesas: ${informacionTema.limiteMesa || 'No especificado'},
            Softwares de Poker: ${informacionTema.softwaresPoker || 'No especificado'},
            Tienes que analizar detalladamente las manos de poker proporcionadas por el usuario, basándote en esas manos tienes que saber qué errores comete, qué manos juega, su estilo de juego, etc.

            Fundamentos del Póker:

Reglas Básicas: Comprender la estructura del juego, las manos ganadoras, las rondas de apuestas y el concepto de pot odds.
Posición en la Mesa: El conocimiento de la posición es fundamental para decidir qué manos jugar. Los jugadores deben ser conscientes de las posiciones relativas y cómo afectan la toma de decisiones.
Lectura de Oponentes: Estudiar las tendencias de los oponentes, aprender a leer sus comportamientos y patrones de apuestas es crucial para ganar ventajas.
Métodos de Enseñanza y Estudio:

Plataformas de Estudio: Usar plataformas de póker en línea como PokerStars, 888Poker y otras, que permiten jugar en mesas virtuales. Las plataformas también ofrecen herramientas de análisis de manos.
Software de Estudio: Utilizar software como PokerTracker o Hold'em Manager para revisar y analizar las propias manos jugadas, así como las estadísticas de los oponentes.
Estudio de Conceptos Avanzados: A medida que se avanza, estudiar estrategias más complejas como el uso del juego de probabilidades, la psicología del póker, y técnicas avanzadas de faroles.
Práctica y Mejora:

Jugar Regularmente: Jugar en mesas de diferentes niveles para adaptar el estilo de juego a situaciones de mayor o menor riesgo.
Revisión de Manos: Es fundamental revisar las manos jugadas para identificar errores y patrones repetitivos. Las plataformas de póker suelen permitir hacer análisis detallados de las jugadas.
Sesiones de Estudio: Los jugadores deben estudiar artículos, videos y libros sobre estrategias avanzadas, como "The Theory of Poker" de David Sklansky o "No Limit Hold'em Theory and Practice" de David Sklansky y Ed Miller.
Personalización del Estudio:

Establecer Metas Claras: Los jugadores deben fijar objetivos de mejora específicos, como mejorar en ciertas áreas del juego (por ejemplo, el juego pre-flop o post-flop).
Adaptación al Estilo de Juego: Ajustar las tácticas según el estilo de los oponentes y el contexto de la partida (torneos, cash games, etc.).`;
        }

        logger.info('Prompt content:', promptContent);

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-4-0613", // Asegúrate de usar un modelo que soporte function calling
                messages: [
                    {
                        role: 'system',
                        content: `Eres un asistente que genera planes de estudio personalizados en formato JSON válido.`
                    },
                    {
                        role: 'user',
                        content: truncateString(promptContent, 1000),
                    }
                ],
                functions: [
                    {
                        name: "generate_study_plan",
                        description: "Genera un plan de estudio personalizado basado en los datos proporcionados.",
                        parameters: {
                            type: "object",
                            properties: {
                                campoEstudio: { type: "string", description: "El campo de estudio." },
                                subCampoEstudio: { type: "string", description: "El subcampo de estudio." },
                                nivelExperiencia: { type: "string", description: "Nivel de experiencia en el tema." },
                                experiencia: { type: "string", description: "Experiencia previa del usuario." },
                                nivelIntensidad: { type: "string", description: "Nivel de intensidad del plan de estudio." },
                                diasEstudio: {
                                    type: "array",
                                    items: { type: "string" },
                                    description: "Días disponibles para estudiar."
                                },
                                planEstudio: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            descripcion: { type: "string", description: "Descripción general." },
                                            dia: { type: "string", description: "Día de la semana." },
                                            tareas: {
                                                type: "array",
                                                items: {
                                                    type: "object",
                                                    properties: {
                                                        titulo: { type: "string", description: "Título de la tarea." },
                                                        contenido: { type: "string", description: "Tiene que ser una explicacion detallada y extensa donde explique que es lo que tiene que estudiar o hacer y donde puede hacerlo(ya sea en plataformas, blogs, videos, etc)."},
                                                        estado: { type: "string", enum: ["esperando", "completado"], description: "Estado de la tarea." }
                                                    }
                                                }
                                            }
                                        },
                                        required: ["descripcion", "dia", "tareas"]
                                    }
                                },
                                objetivos: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            titulo: { type: "string", description: "Título del objetivo." },
                                            descripcion: { type: "string", description: "Descripción del objetivo." }
                                        },
                                        required: ["titulo", "descripcion"]
                                    }
                                }
                            },
                            required: ["campoEstudio", "nivelIntensidad", "diasEstudio", "planEstudio", "objetivos"]
                        }
                    }
                ],
                function_call: { name: "generate_study_plan" },
                max_tokens: 3000,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        logger.info('Response from OpenAI:', response.data);

        let responseData;
        try {
            responseData = response.data.choices[0].message.function_call.arguments;
            logger.info('Response data:', responseData);

            // Verificar si responseData es un string JSON válido
            if (typeof responseData === 'string') {
                try {
                    let parsedResponse = JSON.parse(responseData);

                    // Verifica que parsedResponse sea un objeto plano
                    if (typeof parsedResponse !== 'object' || parsedResponse === null || Array.isArray(parsedResponse)) {
                        throw new Error('La respuesta no es un objeto plano');
                    }

                    logger.info('Parsed response:', parsedResponse);

                    await guardarPlanEstudio(uid, parsedResponse);

                    return res.json(parsedResponse);
                } catch (parseError) {
                    logger.error('Error al analizar la respuesta de OpenAI:', parseError.message);
                    return res.status(500).json({ error: 'Error al analizar la respuesta de OpenAI', details: parseError.message });
                }
            } else {
                throw new Error('La respuesta de OpenAI no es un string JSON válido');
            }
        } catch (parseError) {
            logger.error('Error al analizar la respuesta de OpenAI:', parseError.message);
            return res.status(500).json({ error: 'Error al analizar la respuesta de OpenAI', details: parseError.message });
        }
    } catch (error) {
        logger.error('Error al procesar el plan de estudio:', error.message);
        return res.status(500).json({ error: 'Error al generar el plan de estudio', details: error.message });
    }
});

router.delete('/eliminar-plan/:planId', async (req, res) => {
    const { planId } = req.params;

    try {
        const idToken = req.headers.authorization?.split(' ')[1];
        if (!idToken) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        await eliminarPlanEstudio(uid, planId);
        return res.status(200).json({ message: 'Plan de estudio eliminado correctamente.' });
    } catch (error) {
        logger.error('Error al eliminar el plan de estudio:', error.message);
        return res.status(500).json({ error: 'Error al eliminar el plan de estudio', details: error.message });
    }
});

router.post('/actualizar-estado-tarea', async (req, res) => {
    const { planId, diaIndex, tareaIndex, nuevoEstado } = req.body;

    let uid;
    try {
        const idToken = req.headers.authorization?.split(' ')[1];
        if (!idToken) {
            throw new Error('Token no proporcionado');
        }

        const decodedToken = await admin.auth().verifyIdToken(idToken);
        uid = decodedToken.uid;

        if (!uid) {
            throw new Error('El token no contiene un UID');
        }
    } catch (error) {
        logger.error('Error al verificar el token:', error.message);
        return res.status(401).json({ error: 'Autenticación fallida: ' + error.message });
    }

    try {
        await actualizarEstadoTarea(uid, planId, diaIndex, tareaIndex, nuevoEstado);
        return res.status(200).json({ message: 'Estado de la tarea actualizado correctamente.' });
    } catch (error) {
        logger.error('Error al actualizar el estado de la tarea:', error.message);
        return res.status(500).json({ error: 'Error al actualizar el estado de la tarea', details: error.message });
    }
});

router.get('/obtener-plan/:planId', async (req, res) => {
    const { planId } = req.params;

    let uid;
    try {
        const idToken = req.headers.authorization?.split(' ')[1];
        if (!idToken) {
            throw new Error('Token no proporcionado');
        }

        const decodedToken = await admin.auth().verifyIdToken(idToken);
        uid = decodedToken.uid;

        if (!uid) {
            throw new Error('El token no contiene un UID');
        }
    } catch (error) {
        logger.error('Error al verificar el token:', error.message);
        return res.status(401).json({ error: 'Autenticación fallida: ' + error.message });
    }

    try {
        const userRef = db.collection('usuarios').doc(uid);
        const planRef = userRef.collection('planesEstudio').doc(planId);
        const planDoc = await planRef.get();

        if (!planDoc.exists) {
            throw new Error('El plan de estudio no existe');
        }

        const planData = planDoc.data();
        return res.json(planData);
    } catch (error) {
        logger.error('Error al obtener el plan de estudio:', error.message);
        return res.status(500).json({ error: 'Error al obtener el plan de estudio', details: error.message });
    }
});

module.exports = router;