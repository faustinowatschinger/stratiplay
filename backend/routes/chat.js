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

// Función para eliminar el plan de estudio
const eliminarPlanEstudio = async (uid, planId) => {
    try {
        const userRef = db.collection('usuarios').doc(uid);
        const planRef = userRef.collection('planesEstudio').doc(planId);
        await planRef.delete();
        logger.info('Plan de estudio eliminado exitosamente');
    } catch (error) {
        logger.error('Error al eliminar el plan de estudio:', error);
        throw new Error('Error al eliminar el plan de estudio');
    }
};

router.post('/custom-prompt', async (req, res) => {
    const { informacionTema } = req.body;

    if (!informacionTema || !informacionTema.campo || !informacionTema.tiempoSemana) {
        return res.status(400).json({ error: 'Campos obligatorios faltantes: campo y tiempoSemana.' });
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
        Necesito un plan de estudio detallado, incluyendo objetivos claros, un plan semanal con temas específicos y tareas diarias. Asegúrate de que los campos 'planEstudio', 'objetivos' contengan información detallada.`;

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
                                            horas: { type: "string", description: "Horas de estudio asignadas." },
                                            temas: { type: "array", items: { type: "string" }, description: "Temas a estudiar." },
                                            contenido: {type: "array", items: { type: "string" }, description: "Explicacion detallada de cada tema a estudiar y una recomendacion de donde serguir estudiando ese tema."},
                                            tareas: {
                                                type: "array",
                                                items: {
                                                    type: "object",
                                                    properties: {
                                                        titulo: { type: "string", description: "Título de la tarea." },
                                                        descripcion: { type: "string", description: "Descripción de la tarea." },
                                                        estado: { type: "string", enum: ["esperando", "completado"], description: "Estado de la tarea." }
                                                    }
                                                }
                                            }
                                        },
                                        required: ["descripcion", "dia", "horas", "temas", "tareas"]
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

        let responseData = response.data.choices[0].message.function_call.arguments;
        let parsedResponse = JSON.parse(responseData);

        // Verifica que parsedResponse sea un objeto plano
        if (typeof parsedResponse !== 'object' || parsedResponse === null || Array.isArray(parsedResponse)) {
            throw new Error('La respuesta no es un objeto plano');
        }

        logger.info('Parsed response:', parsedResponse);

        await guardarPlanEstudio(uid, parsedResponse);

        return res.json(parsedResponse);
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

module.exports = router;
