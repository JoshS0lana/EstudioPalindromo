require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');

const app = express();
const port = process.env.PORT || 3000;

// --- Configuración de Firebase ---
// Asegúrate de que la variable de entorno esté correctamente configurada en tu hosting.
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static('public'));
app.use(express.json());

// Ruta para la página principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// --- RUTA PARA LA FORTUNA ---
app.get('/fortuna', async (req, res) => {
    try {
        const fortunaCollection = db.collection('fortunas');
        const snapshot = await fortunaCollection.get();
        if (snapshot.empty) {
            return res.status(404).send('No se encontraron fortunas');
        }
        const fortunas = snapshot.docs.map(doc => doc.data().texto);
        const fortunaAleatoria = fortunas[Math.floor(Math.random() * fortunas.length)];
        res.json({ fortuna: fortunaAleatoria });
    } catch (error) {
        console.error('Error al obtener fortuna:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// --- RUTA PARA POEMAS APESTOSOS ---
// FIX: Esta ruta estaba comentada. La he activado.
app.get('/poemas', (req, res) => {
    const poemas = [
        {
            titulo: "Oda al Calcetín Perdido",
            autor: "Anónimo Desparejado",
            poema: "En el abismo del cesto te busqué,\nentre sábanas y calzones me asomé.\n¿Dónde estás, mi fiel compañero?\nSeguro te tragó el agujero negro del lavadero."
        },
        {
            titulo: "El Chicle Inmortal",
            autor: "Filósofo de la Acera",
            poema: "Pegado al suelo, ves pasar la vida,\nsoportas lluvias, sol y mil pisadas.\nEres más duro que político en campaña,\ny más eterno que la deuda de España."
        },
        {
            titulo: "Lamento del Wi-Fi Caído",
            autor: "El Náufrago Digital",
            poema: "Una barra, ninguna, parpadeas sin fin.\nMi mundo se detiene, oh, trágico confín.\nSin memes, sin series, sin luz en mi existir,\n¡vuelve, señal divina, o voy a sucumbir!"
        }
    ];
    res.json(poemas);
});


// --- RUTA PARA EL TAROT ---
app.get('/tarot', async (req, res) => {
    try {
        const tarotCollection = db.collection('tarot');
        const snapshot = await tarotCollection.get();
        if (snapshot.empty) {
            return res.status(404).send('No se encontraron cartas del tarot');
        }
        const cartas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Barajar y seleccionar 3 cartas
        const barajado = cartas.sort(() => 0.5 - Math.random());
        const seleccion = barajado.slice(0, 3);
        
        res.json(seleccion);
    } catch (error) {
        console.error('Error al obtener tarot:', error);
        res.status(500).send('Error interno del servidor');
    }
});


app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
