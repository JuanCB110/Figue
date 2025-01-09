const express = require('express');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.text());
app.use(express.static(path.join(__dirname, 'frontend')));

// Configurar CORS específicamente
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// API endpoints
app.post('/api/simplex', (req, res) => {
    try {
        const input = req.body;
        const inputFile = path.join(__dirname, 'temp_input.txt');
        const outputFile = path.join(__dirname, 'resultado_simplex.txt');
        require('fs').writeFileSync(inputFile, input);

        const simplexPath = path.join(__dirname, 'algorithms', 'simplex', 'simplex.exe');
        exec(`"${simplexPath}" < "${inputFile}" > "${outputFile}"`, (error, stdout, stderr) => {
            if (error) {
                console.error('Error ejecutando simplex:', error);
                res.status(500).send(stderr);
                return;
            }
            
            // Configurar headers para descarga
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', 'attachment; filename=resultado_simplex.txt');
            
            // Enviar archivo
            res.sendFile(outputFile);
        });
    } catch (error) {
        console.error('Error en el endpoint simplex:', error);
        res.status(500).send(error.message);
    }
});

app.post('/api/saw', (req, res) => {
    try {
        // Guardar input en archivo temporal
        const input = JSON.stringify(req.body);
        const inputFile = path.join(__dirname, 'temp_saw_input.json');
        const outputFile = path.join(__dirname, 'resultado_saw.txt');
        require('fs').writeFileSync(inputFile, input);

        // Ejecutar el programa C#
        const sawPath = path.join(__dirname, 'algorithms', 'saw', 'bin', 'Release', 'net6.0', 'win-x64', 'SAW.exe');
        exec(`"${sawPath}" < "${inputFile}" > "${outputFile}"`, (error, stdout, stderr) => {
            if (error) {
                console.error('Error ejecutando SAW:', error);
                res.status(500).send(stderr);
                return;
            }
            
            // Leer y enviar resultado
            const resultado = require('fs').readFileSync(outputFile, 'utf8');
            res.setHeader('Content-Type', 'text/plain');
            res.send(resultado);
        });
    } catch (error) {
        console.error('Error en el endpoint SAW:', error);
        res.status(500).send(error.message);
    }
});

app.post('/api/datamining', (req, res) => {
    try {
        res.json({ result: "Análisis de patrones en desarrollo" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/neural', (req, res) => {
    try {
        res.json({ result: "Predicción de demanda en desarrollo" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('¡Algo salió mal!');
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
}); 