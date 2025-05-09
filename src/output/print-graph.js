import { showCompletionMessage, showFailMessage } from "./messages.js";

function createGraphFromMatrix(graph, answerGraph = null) {
    const nodes = new vis.DataSet([]);
    const edges = new vis.DataSet([]);
    
    const matrix = graph.Matrix;
    for (let i = 0; i < matrix.length; i++) {
        nodes.add({
            id: i,
            label: `${i}`
        });
    }
    
    const graphType = graph.GenType;
    let border = matrix.length;
    for (let i = 0; i < matrix.length; i++) {
        if (graphType === "SYMM"){
            border = i + 1;
        }
        for (let j = 0; j < border; j++) {
            if (matrix[i][j] > 0) {
                let currentColor = "#3f8534";
                if (answerGraph && answerGraph.Matrix[i][j] != matrix[i][j]){
                    currentColor = "#FF4500";
                }
                if (graphType === "SYMM"){
                    if (matrix[i][j] > 1){
                        edges.add({
                            from: i,
                            to: j,
                            color: {color: currentColor},
                            label: String(matrix[i][j]),
                            font: {color: currentColor}
                        });
                    }
                    else {
                        edges.add({
                            from: i,
                            to: j,
                            color: {color: currentColor}
                        });
                    }
                }
                else{
                    if (matrix[i][j] > 1) {
                        edges.add({
                            from: i,
                            to: j,
                            arrows: 'to',
                            color: {color: currentColor},
                            label: String(matrix[i][j]),
                            font: {color: currentColor}
                        });
                    }
                    else {
                        edges.add({
                            from: i,
                            to: j,
                            arrows: 'to',
                            color: {color: currentColor}
                        });
                    }
                }
            }
        }
    }
    
    return { nodes, edges };
}


export function renderMatrix(graph, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const table = document.createElement("table");
    table.className = "graph-matrix";

    const matrix = graph.Matrix;
    const headerRow = document.createElement("tr");
    headerRow.appendChild(document.createElement("th")); 

    for (let j = 0; j < matrix.length; j++) {
        const th = document.createElement("th");
        th.textContent = j;
        headerRow.appendChild(th);
    }
    table.appendChild(headerRow);
    for (let i = 0; i < matrix.length; i++) {
        const row = document.createElement("tr");
        const th = document.createElement("th");
        th.textContent = i;
        row.appendChild(th);
        for (let j = 0; j < matrix[i].length; j++) {
            const td = document.createElement("td");
            td.textContent = matrix[i][j];
            row.appendChild(td);
        }
        table.appendChild(row);
    }
    container.innerHTML = "";
    container.appendChild(table);
}


export function renderMatrixTraining(graph, containerId, answerGraph = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    const table = document.createElement("table");
    table.className = "graph-matrix";

    const matrix = graph.Matrix;

    const headerRow = document.createElement("tr");
    headerRow.appendChild(document.createElement("th"));

    for (let j = 0; j < matrix.length; j++) {
        const th = document.createElement("th");
        th.textContent = j;
        headerRow.appendChild(th);
    }
    table.appendChild(headerRow);

    for (let i = 0; i < matrix.length; i++) {
        const row = document.createElement("tr");

        const th = document.createElement("th");
        th.textContent = i;
        row.appendChild(th);

        for (let j = 0; j < matrix[i].length; j++) {
            const td = document.createElement("td");
            
            const input = document.createElement("input");
            input.type = "text"; 
            input.maxLength = 1;
            input.dataset.row = i;
            input.dataset.col = j;
            if (matrix[i][j] != -1){
                input.value = matrix[i][j];

                const correctValue = answerGraph.Matrix[i][j];
                if (matrix[i][j] == correctValue) {
                    input.style.backgroundColor = "#e3f8d8"; 
                } else {
                    input.style.backgroundColor = "#ffaaaa"; 
                }
            }
            
            input.addEventListener('input', (e) => {
                const value = e.target.value;
                if (!/^\d*$/.test(value)) {
                    e.target.value = value.replace(/[^\d]/g, ''); 
                }
            });
            
            input.addEventListener('change', (e) => {
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                const value = parseInt(e.target.value) || 0;
                graph.changeEdge(row, col, value);

                const correctValue = answerGraph.Matrix[row][col];
                if (value === correctValue) {
                    e.target.style.backgroundColor = "#e3f8d8"; 
                } else {
                    e.target.style.backgroundColor = "#ffaaaa"; 
                }

                if (checkMatrixCompletion(graph.Matrix, answerGraph.Matrix)) {
                    showCompletionMessage();
                }
                
                displayGraph(graph, "new-graph-container", answerGraph);
            });
                
            td.appendChild(input);
            row.appendChild(td);
        }

        table.appendChild(row);
    }

    container.innerHTML = "";
    container.appendChild(table);
}

export function clearResults() {
    const newMatrixContainer = document.getElementById('new-matrix-container');
    const newGraphContainer = document.getElementById('new-graph-container');
    
    if (newMatrixContainer) newMatrixContainer.innerHTML = '';
    if (newGraphContainer) newGraphContainer.innerHTML = '';
}


export function renderMatrixCheck(graph, containerId, answerGraph = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const oldCheckBtn = document.getElementById("check-answer");
    if (oldCheckBtn) {
        oldCheckBtn.replaceWith(oldCheckBtn.cloneNode(true));
    }

    const table = document.createElement("table");
    table.className = "graph-matrix";

    const matrix = graph.Matrix;

    const headerRow = document.createElement("tr");
    headerRow.appendChild(document.createElement("th")); 

    for (let j = 0; j < matrix.length; j++) {
        const th = document.createElement("th");
        th.textContent = j;
        headerRow.appendChild(th);
    }
    table.appendChild(headerRow);

    for (let i = 0; i < matrix.length; i++) {
        const row = document.createElement("tr");

        const th = document.createElement("th");
        th.textContent = i;
        row.appendChild(th);

        for (let j = 0; j < matrix[i].length; j++) {
            const td = document.createElement("td");
            
            const input = document.createElement("input");
            input.type = "text"; 
            input.maxLength = 1;
            input.dataset.row = i;
            input.dataset.col = j;
            if (matrix[i][j] != -1){
                input.value = matrix[i][j];
            }
            
            input.addEventListener('input', (e) => {
                const value = e.target.value;
                if (!/^\d*$/.test(value)) { 
                    e.target.value = value.replace(/[^\d]/g, ''); 
                }
            });
            
            input.addEventListener('change', (e) => {
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                const value = parseInt(e.target.value) || 0;
                graph.changeEdge(row, col, value);
                
                displayGraph(graph, "new-graph-container");
            });
            
            td.appendChild(input);
            row.appendChild(td);
        }

        table.appendChild(row);
    }

    const checkAnswer = document.getElementById("check-answer");
    if (checkAnswer) {
        checkAnswer.addEventListener('click', () => {
            document.querySelectorAll('.completion-message, .fail-message').forEach(el => el.remove());
            
            if (checkMatrixCompletion(graph.Matrix, answerGraph.Matrix)) {
                showCompletionMessage();
            } else {
                showFailMessage();
            }
        });
    }

    container.innerHTML = ""; 
    container.appendChild(table);
}

export function renderMatrixDemonstration(graph, containerId, answerGraph = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (window.currentAnimation) {
        clearTimeout(window.currentAnimation);
    }

    const table = document.createElement("table");
    table.className = "graph-matrix";

    const matrix = graph.Matrix;
    const answerMatrix = answerGraph.Matrix;

    const headerRow = document.createElement("tr");
    headerRow.appendChild(document.createElement("th")); 

    for (let j = 0; j < matrix.length; j++) {
        const th = document.createElement("th");
        th.textContent = j;
        headerRow.appendChild(th);
    }
    table.appendChild(headerRow);
    for (let i = 0; i < matrix.length; i++) {
        const row = document.createElement("tr");
        const th = document.createElement("th");
        th.textContent = i;
        row.appendChild(th);
        for (let j = 0; j < matrix[i].length; j++) {
            const td = document.createElement("td");
            if (matrix[i][j] != -1){
                td.textContent = matrix[i][j];
            }
            else{
                td.textContent = "";
            }
            row.appendChild(td);
        }
        table.appendChild(row);
    }
    container.innerHTML = "";
    container.appendChild(table);

    const speedControl = document.getElementById('speed-control');
    let speed = 3500 - parseInt(speedControl.value);
    speedControl.addEventListener('input', () => {
        speed = 3500 - parseInt(speedControl.value);
    });

    let currentStep = 0;
    const totalSteps = matrix.length * matrix.length;
    
    const animateStep = () => {
        if (currentStep >= totalSteps) return;
        
        const i = Math.floor(currentStep / matrix.length);
        const j = currentStep % matrix.length;

        if (matrix[i][j] == answerMatrix[i][j]){
            currentStep++;
            window.currentAnimation = setTimeout(animateStep, 0);
            return;
        }
        
        const newValue = answerMatrix[i][j];
        graph.changeEdge(i, j, newValue);
        table.rows[i+1].cells[j+1].textContent = newValue;
        displayGraph(graph, "new-graph-container", answerGraph);
        
        currentStep++;
        window.currentAnimation = setTimeout(animateStep, speed);
    };
    
    animateStep();
}

function checkMatrixCompletion(userMatrix, correctMatrix) {
    for (let i = 0; i < userMatrix.length; i++) {
        for (let j = 0; j < userMatrix[i].length; j++) {
            if (userMatrix[i][j] !== correctMatrix[i][j]) {
                return false;
            }
        }
    }
    return true;
}
  
export function displayGraph(graph, containerId, answerGraph = null) {
    const graphData = createGraphFromMatrix(graph, answerGraph);
    const container = document.getElementById(containerId);
    
    container.style.width = '400px';
    container.style.height = '400px'; 

    const data = {
        nodes: graphData.nodes,
        edges: graphData.edges
    };
    
    const options = {
        layout: {
            randomSeed: 42,
            improvedLayout: false
        },
        physics: false,
        nodes: {
            size: 70,
            font: {
                size: 40,
                face: 'Arial',       
                align: 'center',    
                bold: true,          
                italic: false,     
            },
            shape: 'circle',
            color: {
                background: '#cbfbb1', 
                border: '#6a9f6a',   
            },
            borderWidth: 2, 
            borderWidthSelected: 3
        },
        edges: {
            color: {
                color: '#6a9f6a', 
                opacity: 1.0       
            },
            width: 3,               
            smooth: {                
                type: 'continuous'
            },
            font: {
                size: 20,
                strokeWidth:5, 
            }
        },
        width: '100%',
        height: '100%'
    };

    const nodeCount = data.nodes.length;
    const radius = 200;
    const center = {x: 0, y: 0};
    
    data.nodes.forEach((node, i) => {
        const angle = (i * 2 * Math.PI) / nodeCount - 7;
        node.x = center.x + radius * Math.cos(angle);
        node.y = center.y + radius * Math.sin(angle);
    });
        
    new vis.Network(container, data, options);
}
