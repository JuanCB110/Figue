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
    const rows = parseInt(document.getElementById('data-rows').value);
    const cols = parseInt(document.getElementById('data-cols').value);
    const nClusters = parseInt(document.getElementById('n-clusters').value);
    
    // Recopilar datos
    let data = [];
    for(let i = 0; i < rows; i++) {
        let row = [];
        for(let j = 0; j < cols; j++) {
            row.push(parseFloat(document.getElementById(`data_${i}_${j}`).value));
        }
        data.push(row);
    }

    // Llamar al servicio
    fetch(`${API_URL}/datamining`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            data: data,
            n_clusters: nClusters
        })
    })
    .then(response => response.blob())
    .then(blob => {
        // Crear link de descarga
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resultado_datamining.txt';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // También mostrar en la interfaz
        blob.text().then(text => {
            document.getElementById('datamining-result').innerHTML = `
                <h3>Resultados del Análisis:</h3>
                <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;">
                    ${text}
                </pre>
                <p>El resultado se ha descargado como 'resultado_datamining.txt'</p>
            `;
        });
    })
    .catch(error => {
        document.getElementById('datamining-result').innerHTML = `
            <h3>Error:</h3>
            <pre style="color: red; background-color: #fff0f0; padding: 10px; border-radius: 5px;">
                ${error}
            </pre>
        `;
        console.error('Error:', error);
    });
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

function generateSAWInputs() {
    const alternatives = parseInt(document.getElementById('saw-alternatives').value);
    const criteria = parseInt(document.getElementById('saw-criteria').value);
    
    // Generar matriz de decisión
    let matrixHTML = '<table class="decision-matrix">';
    
    // Encabezados
    matrixHTML += '<tr><th>Alternativa</th>';
    for(let j = 0; j < criteria; j++) {
        matrixHTML += `<th>Criterio ${j+1}</th>`;
    }
    matrixHTML += '</tr>';
    
    // Filas de la matriz
    for(let i = 0; i < alternatives; i++) {
        matrixHTML += `<tr><td>A${i+1}</td>`;
        for(let j = 0; j < criteria; j++) {
            matrixHTML += `<td><input type="number" step="0.01" id="matrix_${i}_${j}" class="matrix-input"></td>`;
        }
        matrixHTML += '</tr>';
    }
    matrixHTML += '</table>';
    document.getElementById('decision-matrix').innerHTML = matrixHTML;

    // Generar inputs para pesos
    let weightsHTML = '<div class="weights-container">';
    for(let j = 0; j < criteria; j++) {
        weightsHTML += `
            <div class="weight-input">
                <label>W${j+1}:</label>
                <input type="number" step="0.01" min="0" max="1" id="weight_${j}" class="weight-input">
            </div>`;
    }
    weightsHTML += '</div>';
    document.getElementById('weights-inputs').innerHTML = weightsHTML;

    // Generar selección de tipo de criterio
    let benefitHTML = '<div class="benefit-container">';
    for(let j = 0; j < criteria; j++) {
        benefitHTML += `
            <div class="benefit-input">
                <label>C${j+1}:</label>
                <select id="benefit_${j}">
                    <option value="true">Beneficio</option>
                    <option value="false">Costo</option>
                </select>
            </div>`;
    }
    benefitHTML += '</div>';
    document.getElementById('benefit-inputs').innerHTML = benefitHTML;
}

function runSAW() {
    const alternatives = parseInt(document.getElementById('saw-alternatives').value);
    const criteria = parseInt(document.getElementById('saw-criteria').value);
    
    // Recopilar matriz de decisión
    let matrix = [];
    for(let i = 0; i < alternatives; i++) {
        let row = [];
        for(let j = 0; j < criteria; j++) {
            row.push(parseFloat(document.getElementById(`matrix_${i}_${j}`).value));
        }
        matrix.push(row);
    }
    
    // Recopilar pesos
    let weights = [];
    for(let j = 0; j < criteria; j++) {
        weights.push(parseFloat(document.getElementById(`weight_${j}`).value));
    }
    
    // Recopilar tipos de criterio
    let isBenefit = [];
    for(let j = 0; j < criteria; j++) {
        isBenefit.push(document.getElementById(`benefit_${j}`).value === 'true');
    }

    // Llamar al servicio
    fetch(`${API_URL}/saw`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            matrix: matrix,
            weights: weights,
            isBenefit: isBenefit
        })
    })
    .then(response => response.text())
    .then(result => {
        document.getElementById('saw-result').innerHTML = `
            <h3>Resultados:</h3>
            <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;">
                ${result}
            </pre>
        `;
    })
    .catch(error => {
        document.getElementById('saw-result').innerHTML = `
            <h3>Error:</h3>
            <pre style="color: red; background-color: #fff0f0; padding: 10px; border-radius: 5px;">
                ${error}
            </pre>
        `;
    });
} 

function generateDataMiningInputs() {
    const rows = parseInt(document.getElementById('data-rows').value);
    const cols = parseInt(document.getElementById('data-cols').value);
    
    // Generar matriz de datos
    let matrixHTML = '<table class="data-matrix">';
    
    // Encabezados
    matrixHTML += '<tr><th>Registro</th>';
    for(let j = 0; j < cols; j++) {
        matrixHTML += `<th>Variable ${j+1}</th>`;
    }
    matrixHTML += '</tr>';
    
    // Filas de datos
    for(let i = 0; i < rows; i++) {
        matrixHTML += `<tr><td>R${i+1}</td>`;
        for(let j = 0; j < cols; j++) {
            matrixHTML += `<td><input type="number" step="0.01" id="data_${i}_${j}" class="data-input"></td>`;
        }
        matrixHTML += '</tr>';
    }
    matrixHTML += '</table>';
    document.getElementById('data-matrix').innerHTML = matrixHTML;
}

function runDataMining() {
    const rows = parseInt(document.getElementById('data-rows').value);
    const cols = parseInt(document.getElementById('data-cols').value);
    const nClusters = parseInt(document.getElementById('n-clusters').value);
    
    // Recopilar datos
    let data = [];
    for(let i = 0; i < rows; i++) {
        let row = [];
        for(let j = 0; j < cols; j++) {
            row.push(parseFloat(document.getElementById(`data_${i}_${j}`).value));
        }
        data.push(row);
    }

    // Llamar al servicio
    fetch(`${API_URL}/datamining`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            data: data,
            n_clusters: nClusters
        })
    })
    .then(response => response.blob())
    .then(blob => {
        // Crear link de descarga
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resultado_datamining.txt';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // También mostrar en la interfaz
        blob.text().then(text => {
            document.getElementById('datamining-result').innerHTML = `
                <h3>Resultados del Análisis:</h3>
                <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;">
                    ${text}
                </pre>
                <p>El resultado se ha descargado como 'resultado_datamining.txt'</p>
            `;
        });
    })
    .catch(error => {
        document.getElementById('datamining-result').innerHTML = `
            <h3>Error:</h3>
            <pre style="color: red; background-color: #fff0f0; padding: 10px; border-radius: 5px;">
                ${error}
            </pre>
        `;
        console.error('Error:', error);
    });
} 