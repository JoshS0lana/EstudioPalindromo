require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const serviceAccount = require("./firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.use(express.static(__dirname));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

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

// --- RUTA PARA POEMAS APESTOSOS (MODIFICADA) ---
app.get('/poemas', (req, res) => {
    // Ahora la ruta devuelve un objeto con los poemas y el manuscrito
    const data = {
        poemas: [
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
        ],
        manuscrito: {
            queEs: {
                titulo: "¿Qué es un poema apestoso?",
                texto: "Es un verso sin vergüenza, un juego de palabras que prefiere la carcajada a la métrica. Nace de la observación cotidiana, de lo absurdo y lo irreverente. No busca la inmortalidad en una antología, sino una sonrisa cómplice."
            },
            porQue: {
                titulo: "¿Por qué un poema apestoso?",
                texto: "Porque la poesía también puede reírse de sí misma, quitarse el corsé y celebrar lo imperfecto. Un poema apestoso es una invitación a escribir sin miedo al ridículo, a encontrar una belleza extraña y divertida en lo inesperado."
            }
        }
    };
    res.json(data);
});


app.get('/tarot', async (req, res) => {
    try {
        const tarotCollection = db.collection('tarot');
        const snapshot = await tarotCollection.get();
        if (snapshot.empty) {
            return res.status(404).send('No se encontraron cartas del tarot');
        }
        const cartas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
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
