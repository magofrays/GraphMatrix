import {showCompletionMessage} from "./messages.js";

/**
 * Создаёт или обновляет контейнер с классом "content-wrapper" внутри указанного
 * элемента.
 *
 * @param {HTMLElement} container - Элемент, в который добавляется контейнер.
 */
export function createContentWrapper(container) {
    if (!container)
        return;
    let contentWrapper = container.querySelector(".content-wrapper");
    if (contentWrapper) {
        contentWrapper.remove()
    }
    container.insertAdjacentHTML('beforeend', `
                        <div class="content-wrapper" id="content-wrapper">
                            <div class="matrix-container"></div>
                            <div class="graph-container"></div>
                        </div>
                    `);
}

/**
 * Создаёт набор узлов и рёбер на основе матрицы графа для отрисовки графа.
 *
 * @param {Graph} graph - Граф, на основе которого создаются узлы и рёбра.
 * @param {Graph} [answerGraph=null] - Граф с правильным ответом (для
 * сравнения).
 * @returns {{nodes: vis.DataSet, edges: vis.DataSet}} Объект с узлами и рёбрами
 * для отрисовки.
 */
function createGraphFromMatrix(graph, answerGraph = null) {
    const nodes = new vis.DataSet([]);
    const edges = new vis.DataSet([]);

    const matrix = graph.Matrix;
    for (let i = 0; i < matrix.length; i++) {
        nodes.add({
            id : i,
            label : `${i}`,
        });
    }
    const graphType = graph.GenType;
    let border = matrix.length;
    let addColor = "#effde7";
    for (let i = 0; i < matrix.length; i++) {
        edges.add({
            from : i,
            to : i,
            color : {color : addColor},
        });
    }
    for (let i = 0; i < matrix.length; i++) {
        if (graphType === "SYMM") {
            border = i + 1;
        }
        for (let j = 0; j < border; j++) {
            if (matrix[i][j] > 0) {
                let currentColor = "#3f8534";
                if (answerGraph && answerGraph.Matrix[i][j] != matrix[i][j]) {
                    currentColor = "#FF4500";
                }
                if (graphType === "SYMM") {
                    if (matrix[i][j] > 1) {
                        edges.add({
                            from : i,
                            to : j,
                            color : {color : currentColor},
                            label : String(matrix[i][j]),
                            font : {color : currentColor}
                        });
                    } else {
                        edges.add(
                            {from : i, to : j, color : {color : currentColor}});
                    }
                } else {
                    if (matrix[i][j] > 1) {
                        edges.add({
                            from : i,
                            to : j,
                            arrows : 'to',
                            color : {color : currentColor},
                            label : String(matrix[i][j]),
                            font : {color : currentColor}
                        });
                    } else {
                        edges.add({
                            from : i,
                            to : j,
                            arrows : 'to',
                            color : {color : currentColor}
                        });
                    }
                }
            }
        }
    }
    return {nodes, edges};
}

/**
 * Отрисовывает матрицу графа в указанном контейнере.
 *
 * @param {Graph} graph - Граф, матрица которого будет отображена.
 * @param {HTMLElement} container - Контейнер, в котором будет отрисована
 * матрица.
 * @param {boolean} [isTrue=false] - Если true, таблица будет окрашена как
 * завершённая.
 */
export function renderMatrix(graph, container, isTrue = false) {
    if (!container)
        return;
    let matrixContainer = container.querySelector(".matrix-container");
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
            if (isTrue) {
                td.style.backgroundColor = "#e3f8d8";
            }
            row.appendChild(td);
        }
        table.appendChild(row);
    }
    matrixContainer.innerHTML = "";
    matrixContainer.appendChild(table);
}

/**
 * Отрисовывает интерактивную матрицу для режима тренажера.
 *
 * @param {Graph} graph - Граф, матрица которого будет отрисована.
 * @param {HTMLElement} container - Контейнер, в котором будет отрисована
 * матрица.
 * @param {Graph} answerGraph - Граф с правильной матрицей для проверки.
 * @param {Function} onComplete - Функция, вызываемая при успешном выполнении
 * задания.
 */
export function renderMatrixTraining(graph, container, answerGraph,
                                     onComplete) {
    if (!container)
        return;
    const matrixContainer = container.querySelector('.matrix-container');
    matrixContainer.innerHTML = '';
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
            input.maxLength = 4;
            input.dataset.row = i;
            input.dataset.col = j;
            if (matrix[i][j] != -1) {
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
                let value =
                    e.target.value === '' ? -1 : parseInt(e.target.value);
                if (isNaN(value))
                    value = -1;
                graph.changeEdge(row, col, value);
                const correctValue = answerGraph.Matrix[row][col];
                if (value == -1) {
                    e.target.style.backgroundColor = "#f9f9f9";
                } else if (value === correctValue) {
                    e.target.style.backgroundColor = "#e3f8d8";
                } else {
                    e.target.style.backgroundColor = "#ffaaaa";
                }
                if (checkMatrixCompletion(graph.Matrix, answerGraph.Matrix)) {
                    showCompletionMessage();
                    lockMatrixInputs(matrixContainer);
                    onComplete();
                }
                displayGraph(graph, container, answerGraph);
            });
            td.appendChild(input);
            row.appendChild(td);
        }
        table.appendChild(row);
    }
    displayGraph(graph, container, answerGraph);
    matrixContainer.innerHTML = "";
    matrixContainer.appendChild(table);
    if (checkMatrixCompletion(graph.Matrix, answerGraph.Matrix)) {
        lockMatrixInputs(matrixContainer);
        onComplete(container);
    }
}

/**
 * Отрисовывает интерактивную матрицу для режима проверки.
 *
 * @param {Graph} graph - Граф, матрица которого будет отрисована.
 * @param {HTMLElement} container - Контейнер, в котором будет отрисована
 * матрица.
 */
export function renderMatrixCheck(graph, container) {
    if (!container)
        return;
    const matrixContainer = container.querySelector('.matrix-container');
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
            input.maxLength = 4;
            input.dataset.row = i;
            input.dataset.col = j;
            if (matrix[i][j] != -1) {
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
                let value =
                    e.target.value === '' ? -1 : parseInt(e.target.value);
                if (isNaN(value))
                    value = -1;
                graph.changeEdge(row, col, value);
                displayGraph(graph, container);
            });
            td.appendChild(input);
            row.appendChild(td);
        }
        table.appendChild(row);
    }
    displayGraph(graph, container);
    matrixContainer.innerHTML = "";
    matrixContainer.appendChild(table);
}

/**
 * Анимированно демонстрирует изменение матрицы в реальном времени.
 * в режиме демонстрации
 * 
 * @param {Graph} graph - Граф, матрица которого будет анимирована.
 * @param {HTMLElement} container - Контейнер, в котором будет отрисована
 * матрица.
 * @param {Graph} [answerGraph=null] - Граф с правильным результатом.
 */
export function renderMatrixDemonstration(graph, container,
                                          answerGraph = null) {
    if (!container)
        return;
    const matrixContainer = container.querySelector('.matrix-container');
    if (window.currentAnimation) {
        clearTimeout(window.currentAnimation);
    }
    matrixContainer.innerHTML = '';
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
            if (matrix[i][j] != -1) {
                td.textContent = matrix[i][j];
            } else {
                td.textContent = "";
            }
            row.appendChild(td);
        }
        table.appendChild(row);
    }
    matrixContainer.appendChild(table);
    const speedControl = container.querySelector('.speed-control');
    let speed = 3500 - parseInt(speedControl.value);
    speedControl.addEventListener(
        'input', () => { speed = 3500 - parseInt(speedControl.value); });
    let currentStep = 0;
    const totalSteps = matrix.length * matrix.length;
    const animateStep = () => {
        if (currentStep >= totalSteps)
            return;
        const i = Math.floor(currentStep / matrix.length);
        const j = currentStep % matrix.length;
        const newValue = answerMatrix[i][j];
        graph.changeEdge(i, j, newValue);
        table.rows[i + 1].cells[j + 1].textContent = newValue;
        displayGraph(graph, container, answerGraph);
        currentStep++;
        window.currentAnimation = setTimeout(animateStep, speed);
    };

    animateStep();
}

/**
 * Проверяет, совпадает ли пользовательская матрица с правильной.
 *
 * @param {number[][]} userMatrix - Матрица пользователя.
 * @param {number[][]} correctMatrix - Правильная матрица.
 * @returns {boolean} true, если матрицы совпадают.
 */
export function checkMatrixCompletion(userMatrix, correctMatrix) {
    for (let i = 0; i < userMatrix.length; i++) {
        for (let j = 0; j < userMatrix[i].length; j++) {
            if (userMatrix[i][j] !== correctMatrix[i][j]) {
                return false;
            }
        }
    }
    return true;
}

/**
 * Отображает граф визуально в указанном контейнере.
 *
 * @param {Graph} graph - Граф, который нужно отобразить.
 * @param {HTMLElement} container - Контейнер, в котором будет отрисован граф.
 * @param {Graph} [answerGraph=null] - Граф с правильным ответом (для
 * подсветки).
 */
export function displayGraph(graph, container, answerGraph = null) {
    if (!container) {
        return;
    }
    let graphContainer = container.querySelector(".graph-container");
    const graphData = createGraphFromMatrix(graph, answerGraph);
    graphContainer.style.width = '450px';
    graphContainer.style.height = '450px';
    const data = {nodes : graphData.nodes, edges : graphData.edges};
    const options = {
        layout : {randomSeed : 42, improvedLayout : false},
        nodes : {
            size : 30,
            font : {
                size : 30,
                face : 'Arial',
                align : 'center',
            },
            fixed : {x : true, y : true},
            physics : false,
            shape : 'circle',
            color : {
                background : '#cbfbb1',
                border : '#6a9f6a',
                highlight : {background : '#cbfbb1', border : '#6a9f6a'}
            },
            borderWidth : 2,
            borderWidthSelected : 2,
            scaling : {min : 30, max : 30, label : {enabled : false}}
        },
        edges : {
            selfReference : {size : 20, angle : Math.PI / 4},
            color : {color : '#6a9f6a', opacity : 1.0, highlight : '#6a9f6a'},
            width : 3,
            smooth : {type : 'continuous', roundness : 0.5},
            font : {
                size : 20,
                strokeWidth : 5,
            },
            physics : false
        },
        physics : {
            enabled : false,
            stabilization : {enabled : true, iterations : 100}
        },
        interaction : {
            zoomView : false,
            dragView : false,
            dragNodes : false,
            selectable : false,
            hover : false,
            tooltipDelay : 0,
            hideEdgesOnDrag : false,
            hideNodesOnDrag : false
        },
        width : '100%',
        height : '100%',
        autoResize : false
    };
    const nodeCount = data.nodes.length;
    const radius = 170;
    const center = {x : 200, y : 210};
    data.nodes.forEach((node, i) => {
        const angle = (i * 2 * Math.PI) / nodeCount - 7;
        node.x = center.x + radius * Math.cos(angle);
        node.y = center.y + radius * Math.sin(angle);
    });
    const network = new vis.Network(graphContainer, data, options);
    network.once('stabilizationIterationsDone', function() {
        network.setOptions({
            nodes :
                {size : 30, scaling : {min : 25, max : 25}, font : {size : 30}}
        });
        network.redraw();
    });
}

/**
 * Блокирует поля ввода матрицы, делая их только для чтения.
 *
 * @param {HTMLElement} matrixContainer - Контейнер матрицы.
 */
export function lockMatrixInputs(matrixContainer) {
    const inputs = matrixContainer.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
        input.readOnly = true;
        input.style.backgroundColor = '#e3f8d8';
        input.style.cursor = 'not-allowed';
    });
}