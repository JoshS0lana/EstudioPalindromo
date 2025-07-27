const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// La carga del service account no cambia
const serviceAccount = require('./firebase-service-account.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Asegurarse de que la API Key se carga
if (!process.env.GEMINI_API_KEY) {
    console.error("FATAL ERROR: La variable de entorno GEMINI_API_KEY no está definida.");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Ruta para suscriptores (sin cambios)
app.post('/api/subscribe', async (req, res) => {
    try {
        const { contact } = req.body;
        if (!contact) {
            return res.status(400).json({ error: 'El campo de contacto es requerido' });
        }
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
        // FIX: Se añade un log de error mucho más detallado
        // Esto te ayudará a ver el problema real en los logs de Render
        console.error('--- ERROR DETALLADO DE GEMINI API ---');
        console.error('Ha ocurrido un error al contactar la API de Gemini.');
        console.error('Causa probable: La API Key no es válida o está mal configurada en las variables de entorno de Render.');
        console.error('Error original:', error.message);
        console.error('--- FIN DEL ERROR ---');
        
        res.status(500).json({ error: 'Error generando la fortuna. Revisa los logs del servidor.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
