const express = require('express');
const cors = require('cors'); // Importa el middleware cors
const app = express();
const admin = require('./firebase'); // Importa la inicialización de Firebase

// Configura CORS para permitir solicitudes desde http://localhost:5173
app.use(cors({
    origin: 'http://localhost:5173'
}));

// Resto de tu configuración de servidor
app.use(express.json());
app.use('/api/chat', require('./routes/chat'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});