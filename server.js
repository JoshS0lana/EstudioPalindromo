require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Importar el SDK de Gemini

const app = express();
const port = process.env.PORT || 3000;

// Inicializa el cliente de Gemini con la API Key desde las variables de entorno
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.static(__dirname)); // Sirve los archivos estáticos (HTML, CSS, imágenes)
app.use(express.json());

// Ruta principal que sirve el index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// --- RUTA PARA POEMAS APESTOSOS ---
// Devuelve los datos de los poemas y el manuscrito
app.get('/poemas', (req, res) => {
    const data = {
        poemas: [
            { titulo: "Oda al Calcetín Perdido", autor: "Anónimo Desparejado", poema: "En el abismo del cesto te busqué,\nentre sábanas y calzones me asomé.\n¿Dónde estás, mi fiel compañero?\nSeguro te tragó el agujero negro del lavadero." },
            { titulo: "El Chicle Inmortal", autor: "Filósofo de la Acera", poema: "Pegado al suelo, ves pasar la vida,\nsoportas lluvias, sol y mil pisadas.\nEres más duro que político en campaña,\ny más eterno que la deuda de España." },
            { titulo: "Lamento del Wi-Fi Caído", autor: "El Náufrago Digital", poema: "Una barra, ninguna, parpadeas sin fin.\nMi mundo se detiene, oh, trágico confín.\nSin memes, sin series, sin luz en mi existir,\n¡vuelve, señal divina, o voy a sucumbir!" }
        ],
        manuscrito: {
            queEs: { titulo: "¿Qué es un poema apestoso?", texto: "Es un verso sin vergüenza, un juego de palabras que prefiere la carcajada a la métrica. Nace de la observación cotidiana, de lo absurdo y lo irreverente. No busca la inmortalidad en una antología, sino una sonrisa cómplice." },
            porQue: { titulo: "¿Por qué un poema apestoso?", texto: "Porque la poesía también puede reírse de sí misma, quitarse el corsé y celebrar lo imperfecto. Un poema apestoso es una invitación a escribir sin miedo al ridículo, a encontrar una belleza extraña y divertida en lo inesperado." }
        }
    };
    res.json(data);
});

// --- RUTA PARA EL TAROT ---
// Devuelve 3 cartas al azar (puedes conectarlo a Firestore después si quieres)
app.get('/tarot', (req, res) => {
    const todasLasCartas = [
        { name: "El Viaje Desolado", image: "imagenes/tarot-1.png", interpretation: "El viaje inicia con abandono, dejando atrás lo que ya no sirve." },
        { name: "La Soledad del Desierto", image: "imagenes/tarot-2.jpg", interpretation: "La soledad y aridez subrayan un aislamiento sin guía espiritual." },
        { name: "La Ascensión", image: "imagenes/tarot-3.jpeg", interpretation: "Una revelación forzosa que impulsa a emprender la redención." },
        { name: "El Paraíso", image: "imagenes/tarot-4.jpg", interpretation: "La culminación del viaje, un reencuentro que trae paz y gracia." }
    ];
    const barajado = todasLasCartas.sort(() => 0.5 - Math.random());
    const seleccion = barajado.slice(0, 3);
    res.json(seleccion);
});

// --- NUEVA RUTA SEGURA PARA GENERAR FORTUNAS CON GEMINI ---
app.post('/generate-fortune', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const prompt = "Escribe una fortuna para una galleta, en español. Debe ser corta, poética, y con un toque de melancolía sobre el pasado, el amor perdido o el destino. Como si la hubiera escrito un escritor recordando su juventud. Máximo 20 palabras.";
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ fortuna: text.trim().replace(/"/g, '') });

    } catch (error) {
        console.error("Error al generar fortuna desde el backend:", error);
        res.status(500).json({ error: "No se pudo generar una fortuna en este momento." });
    }
});


app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
