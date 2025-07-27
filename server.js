const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

// === NUEVO: Configuración de Firebase Admin ===
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Carga las credenciales de tu cuenta de servicio de Firebase
// ¡Asegúrate de tener tu archivo .json en la carpeta del proyecto!
const serviceAccount = require('./firebase-service-account.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
// ==========================================

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Configurar Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// === NUEVO: Ruta para guardar correos/usuarios ===
app.post('/api/subscribe', async (req, res) => {
    try {
        const { contact } = req.body;
        if (!contact) {
            return res.status(400).json({ error: 'El campo de contacto es requerido' });
        }
        
        // Crea un nuevo documento en la colección 'subscribers' con un ID automático
        const docRef = await db.collection('subscribers').add({
            contact: contact,
            subscribedAt: new Date()
        });

        console.log("Nuevo suscriptor guardado con ID:", docRef.id);
        res.status(201).json({ success: true, message: '¡Gracias por suscribirte!' });
    } catch (error) {
        console.error('Error al guardar en Firestore:', error);
        res.status(500).json({ error: 'No se pudo procesar la suscripción' });
    }
});
// =============================================

// Ruta para generar fortunas
app.post('/api/generate-fortune', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = req.body.prompt;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const fortune = response.text();
        
        res.json({ fortune });
    } catch (error) {
        console.error('Error al contactar la API de Gemini:', error);
        res.status(500).json({ error: 'Error generando la fortuna' });
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
