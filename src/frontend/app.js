const API_URL = 'http://localhost:3000/api';

async function runSimplex() {
    try {
        const input = JSON.parse(document.getElementById('simplex-input').value);
        const response = await fetch(`${API_URL}/simplex`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ matrix: input })
        });
        
        const data = await response.json();
        document.getElementById('simplex-result').innerHTML = 
            `<pre>${JSON.stringify(data.result, null, 2)}</pre>`;
    } catch (error) {
        alert('Error al ejecutar Simplex: ' + error.message);
    }
}

async function runSAW() {
    try {
        const matrix = JSON.parse(document.getElementById('saw-matrix').value);
        const weights = document.getElementById('saw-weights').value.split(',').map(Number);
        const isBenefit = document.getElementById('saw-benefit').value.split(',').map(x => x === 'true');
        
        const response = await fetch(`${API_URL}/saw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ matrix, weights, isBenefit })
        });
        
        const data = await response.json();
        document.getElementById('saw-result').innerHTML = 
            `<pre>${JSON.stringify(data.result, null, 2)}</pre>`;
    } catch (error) {
        alert('Error al ejecutar SAW: ' + error.message);
    }
}

async function runDataMining() {
    try {
        const data = JSON.parse(document.getElementById('datamining-input').value);
        const n_clusters = parseInt(document.getElementById('clusters').value);
        
        const response = await fetch(`${API_URL}/datamining`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data, n_clusters })
        });
        
        const result = await response.json();
        document.getElementById('datamining-result').innerHTML = 
            `<pre>${JSON.stringify(result.result, null, 2)}</pre>`;
    } catch (error) {
        alert('Error al ejecutar Minería de Datos: ' + error.message);
    }
}

async function runNeural() {
    try {
        const trainingData = JSON.parse(document.getElementById('neural-training').value);
        const expectedOutputs = JSON.parse(document.getElementById('neural-expected').value);
        const epochs = parseInt(document.getElementById('epochs').value);
        
        const response = await fetch(`${API_URL}/neural`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ trainingData, expectedOutputs, epochs })
        });
        
        const data = await response.json();
        document.getElementById('neural-result').innerHTML = 
            `<pre>${JSON.stringify(data.result, null, 2)}</pre>`;
    } catch (error) {
        alert('Error al ejecutar Red Neuronal: ' + error.message);
    }
}

function generateSimplexInputs() {
    const vars = parseInt(document.getElementById('simplex-vars').value);
    const constraints = parseInt(document.getElementById('simplex-const').value);
    
    // Generar función objetivo
    let objHTML = 'Maximizar Z = ';
    for (let i = 0; i < vars; i++) {
        objHTML += `<input type="number" class="simplex-input" id="obj_${i}">x${i+1}`;
        if (i < vars - 1) objHTML += ' + ';
    }
    document.getElementById('objective-function').innerHTML = objHTML;

    // Generar restricciones
    let constHTML = '';
    for (let i = 0; i < constraints; i++) {
        constHTML += '<div class="constraint-row">';
        for (let j = 0; j < vars; j++) {
            constHTML += `<input type="number" class="simplex-input" id="const_${i}_${j}">x${j+1}`;
            if (j < vars - 1) constHTML += ' + ';
        }
        constHTML += ` ≤ <input type="number" class="simplex-input" id="rhs_${i}"></div>`;
    }
    document.getElementById('constraints').innerHTML = constHTML;
}

function runSimplex() {
    const vars = parseInt(document.getElementById('simplex-vars').value);
    const constraints = parseInt(document.getElementById('simplex-const').value);
    
    let input = `${vars} ${constraints}\n`;
    
    // Función objetivo
    for (let i = 0; i < vars; i++) {
        input += document.getElementById(`obj_${i}`).value + ' ';
    }
    input += '\n';
    
    // Restricciones
    for (let i = 0; i < constraints; i++) {
        for (let j = 0; j < vars; j++) {
            input += document.getElementById(`const_${i}_${j}`).value + ' ';
        }
        input += document.getElementById(`rhs_${i}`).value + '\n';
    }

    // Llamar al servicio
    fetch(`${API_URL}/simplex`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'text/plain'
        },
        body: input
    })
    .then(response => response.blob())
    .then(blob => {
        // Crear link de descarga
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resultado_simplex.txt';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // También mostrar en la interfaz
        blob.text().then(text => {
            document.getElementById('simplex-result').innerHTML = `
                <h3>Solución:</h3>
                <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;">
                    ${text}
                </pre>
                <p>El resultado se ha descargado como 'resultado_simplex.txt'</p>
            `;
        });
    })
    .catch(error => {
        document.getElementById('simplex-result').innerHTML = `
            <h3>Error:</h3>
            <pre style="color: red; background-color: #fff0f0; padding: 10px; border-radius: 5px;">
                ${error}
            </pre>
        `;
        console.error('Error:', error);
    });
} 