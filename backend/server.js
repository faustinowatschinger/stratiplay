const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chat');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
    origin: "http://localhost:5173",  // Cambia el puerto de tu frontend si es necesario
    methods: ["GET", "POST"],
};

app.use(cors(corsOptions));  // Configura CORS para permitir solicitudes desde tu frontend

app.use(express.json());
app.use('/api/chat', chatRoutes);  // Registra la ruta del chat

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});