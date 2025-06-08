import {showCompletionMessage} from "./messages.js";

const appColors =
    {
        redArrow : "#FF4500",
        greenArrow : "#3f8534",
        greenCell : "#e3f8d8",
        highlightArrow : "#848484",
        redCell : "#ffaaaa",
        defaultCell : "#f9f9f9"
    }

/**
 * Создаёт или обновляет контейнер с классом "content-wrapper" внутри указанного
 * элемента.
 *
 * @param {HTMLElement} container - Элемент, в который добавляется контейнер.
 */
export function createContentWrapper(container) {
    if (!container)
        return;
    // let contentWrapper = container.querySelector(".content-wrapper");
    // if (contentWrapper) {
    //     contentWrapper.remove()
    // }
    container.insertAdjacentHTML('beforeend', `
                        <div class="content-wrapper" id="content-wrapper">
                            <div class="content-text-container wrapper-item-1"></div>
                            <div class="matrix-container wrapper-item-2"></div>
                            <div class="graph-container wrapper-item-3"></div>
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
    for (let i = 0; i < matrix.length; i++) {
        if (graphType === "SYMM") {
            border = i + 1;
        }
        for (let j = 0; j < border; j++) {
            if (matrix[i][j] > 0) {
                let currentColor = appColors.greenArrow;
                if (answerGraph && answerGraph.Matrix[i][j] != matrix[i][j]) {
                    currentColor = appColors.redArrow;
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

function signCellToEdge(uiGraph, cell, i, j) {
    const edge =
        uiGraph.ui.edges.get({filter : e => e.from === i && e.to === j})[0];

    if (edge) {
        const edgeColor = edge.color?.color;
        cell.addEventListener('mouseover', () => {
            uiGraph.ui.edges.update({
                id : edge.id,
                color : {
                    color : appColors.highlightArrow,
                },
                width : 4,
            });
        });
        cell.addEventListener('mouseleave', () => {
            uiGraph.ui.edges.update({
                id : edge.id,
                color : {
                    color : edgeColor,
                },
                width : 2
            });
        });
    }
}

function createEmptyMatrix(size) {
    const table = document.createElement("table");
    table.className = "graph-matrix";
    const headerRow = document.createElement("tr");
    headerRow.appendChild(document.createElement("th"));
    for (let j = 0; j < size; j++) {
        const th = document.createElement("th");
        th.textContent = j;
        headerRow.appendChild(th);
    }
    table.appendChild(headerRow);
    for (let i = 0; i < size; i++) {
        const row = document.createElement("tr");
        const th = document.createElement("th");
        th.textContent = i;
        row.appendChild(th);
        for (let j = 0; j < size; j++) {
            const td = document.createElement("td");
            row.appendChild(td);
        }
        table.appendChild(row);
    }
    return table;
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
export function renderMatrix(graph, container, isTrue = false,
                             drawGraph = false) {
    let uiGraph = null;
    if (drawGraph) {
        uiGraph = displayGraph(graph, container);
    }
    if (!container)
        return;
    let matrixContainer = container.querySelector(".matrix-container");
    const matrix = graph.Matrix;
    const table = createEmptyMatrix(matrix.length);
    for (let i = 0; i < matrix.length; i++) {
        const row = table.rows[i + 1];
        for (let j = 0; j < matrix[i].length; j++) {
            const cell = row.cells[j + 1];
            if (uiGraph)
                signCellToEdge(uiGraph, cell, i, j);
            cell.textContent = matrix[i][j];
            if (isTrue) {
                cell.style.backgroundColor = appColors.greenCell;
            }
        }
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
    const uiGraph = displayGraph(graph, container, answerGraph);
    const matrixContainer = container.querySelector('.matrix-container');
    const maxLength = String(answerGraph.findMaxWeight()).length;
    const matrix = graph.Matrix;
    const table = createEmptyMatrix(matrix.length);

    for (let i = 0; i < matrix.length; i++) {
        const row = table.rows[i + 1];
        for (let j = 0; j < matrix[i].length; j++) {
            const cell = row.cells[j + 1];
            const input = document.createElement("input");
            input.type = "text";
            input.maxLength = maxLength;
            input.dataset.row = i;
            input.dataset.col = j;
            if (matrix[i][j] != -1) {
                signCellToEdge(uiGraph, cell, i, j);
                input.value = matrix[i][j];
                const correctValue = answerGraph.Matrix[i][j];
                if (matrix[i][j] == correctValue) {
                    input.style.backgroundColor = appColors.greenCell;
                } else {
                    input.style.backgroundColor = appColors.redCell;
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
                let arrowColor = null;
                const correctValue = answerGraph.Matrix[row][col];
                if (value == -1) {
                    e.target.style.backgroundColor = appColors.defaultCell;
                    arrowColor = appColors.greenArrow;
                } else if (value === correctValue) {
                    e.target.style.backgroundColor = appColors.greenCell;
                    arrowColor = appColors.greenArrow;
                } else {
                    e.target.style.backgroundColor = appColors.redCell;
                    arrowColor = appColors.redArrow;
                }
                changeEdge(uiGraph, row, col, arrowColor, value);
                signCellToEdge(uiGraph, cell, row, col);

                if (checkMatrixCompletion(graph.Matrix, answerGraph.Matrix)) {
                    showCompletionMessage();
                    lockMatrixInputs(matrixContainer);
                    onComplete();
                }
            });
            cell.appendChild(input);
        }
    }
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
export function renderMatrixCheck(graph, container, answerGraph) {
    if (!container)
        return;
    const uiGraph = displayGraph(graph, container);
    const matrixContainer = container.querySelector('.matrix-container');
    const matrix = graph.Matrix;
    const table = createEmptyMatrix(matrix.length);
    const maxLength = String(answerGraph.findMaxWeight()).length;
    for (let i = 0; i < matrix.length; i++) {
        const row = table.rows[i + 1];
        for (let j = 0; j < matrix[i].length; j++) {
            const cell = row.cells[j + 1];
            const input = document.createElement("input");
            input.type = "text";
            input.maxLength = maxLength;
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
                changeEdge(uiGraph, row, col, appColors.greenArrow, value);
                signCellToEdge(uiGraph, cell, row, col)
            });
            cell.appendChild(input);
        }
    }
    matrixContainer.innerHTML = "";
    matrixContainer.appendChild(table);
}

function changeEdge(uiGraph, i, j, arrowColor, value) {
    removeEdge(uiGraph, i, j);
    if (value > 0) {
        uiGraph.ui.edges.add({
            from : i,
            to : j,
            color : {color : arrowColor},
            arrows : 'to',
            color : {color : arrowColor},
            label : value > 1 ? String(value) : "",
            font : {color : arrowColor}
        });
    }
    uiGraph.network.fit(
        {animation : {duration : 1000, easingFunction : "easeInOutQuad"}});
}

function removeEdge(uiGraph, i, j) {
    const edge =
        uiGraph.ui.edges.get({filter : e => e.from === i && e.to === j})[0];
    if (edge)
        uiGraph.ui.edges.remove(edge.id);
}
/**
 * Анимированно демонстрирует изменение матрицы в реальном времени.
 * в режиме демонстрации
 *
 * @param {Graph} graph - Граф, матрица которого будет анимирована.
 * @param {HTMLElement} container - Контейнер, в котором будет отрисована
 * матрица.
 * @param {Graph} [answerGraph] - Граф с правильным результатом.
 */
export function renderMatrixDemonstration(graph, container, answerGraph) {
    if (!container)
        return;

    const uiGraph = displayGraph(graph, container, null);

    const matrixContainer = container.querySelector('.matrix-container');
    if (window.currentAnimation) {
        clearTimeout(window.currentAnimation);
    }

    const matrix = graph.Matrix;
    const table = createEmptyMatrix(matrix.length);
    const answerMatrix = answerGraph.Matrix;

    for (let i = 0; i < matrix.length; i++) {
        const row = table.rows[i + 1];
        for (let j = 0; j < matrix[i].length; j++) {
            const cell = row.cells[j + 1];
            if (matrix[i][j] != -1) {
                cell.textContent = matrix[i][j];
                signCellToEdge(uiGraph, cell, i, j);
            } else {
                cell.textContent = "";
            }
        }
    }
    matrixContainer.appendChild(table);
    const speedControl = document.querySelector('.speed-control');
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
        const cell = table.rows[i + 1].cells[j + 1];
        cell.textContent = newValue;

        changeEdge(uiGraph, i, j, appColors.greenArrow, graph.Matrix[i][j]);
        signCellToEdge(uiGraph, cell, i, j);

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
        return null;
    }
    let graphContainer = container.querySelector(".graph-container");
    const graphData = createGraphFromMatrix(graph, answerGraph);
    graphContainer.style.width = '370px';
    graphContainer.style.height = '370px';
    const data = {nodes : graphData.nodes, edges : graphData.edges};
    const options = {
        layout : {improvedLayout : false, randomSeed : 42},
        nodes : {
            size : 30,
            font : {
                size : 30,
                face : 'Arial',
                align : 'center',
                color : '#2c3e50',
                strokeWidth : 3,
                strokeColor : '#ffffff'
            },
            shape : 'circle',
            color : {
                background : '#cbfbb1',
                border : '#6a9f6a',
                highlight : {background : '#a8e6a8', border : '#4a7c4a'},
                hover : {background : '#a8e6a8', border : '#4a7c4a'}
            },
            borderWidth : 2,
            borderWidthSelected : 4,
            shadow : {
                enabled : true,
                color : 'rgba(0,0,0,0.2)',
                size : 10,
                x : 5,
                y : 5
            },
        },
        edges : {
            selfReference : {size : 20, angle : Math.PI / 4},
            color : {
                color : '#6a9f6a',
                opacity : 1.0,
                highlight : '#4a7c4a',
                hover : '#848484'
            },
            width : 2,
            selectionWidth : 4,
            smooth : {type : 'continuous', roundness : 0.5},
            font : {
                size : 17,
                face : 'Arial',
                strokeWidth : 5,
                color : '#2c3e50',
                align : 'middle'
            },
            arrows : {to : {enabled : true, scaleFactor : 0.8, type : 'arrow'}},
            shadow : {
                enabled : true,
                color : 'rgba(0,0,0,0.1)',
                size : 10,
                x : 2,
                y : 2
            }
        },
        interaction : {
            zoomView : false,
            dragView : false,
            dragNodes : false,
            multiselect : false,
            hover : true,
        },
        physics : {
            enabled : true,
            stabilization :
                {enabled : true, iterations : 50, updateInterval : 10},
            solver : 'repulsion',
            repulsion : {
                nodeDistance : 1,
                springLength : 1,
                springConstant : 0,
                centralGravity : 0.1
            }
        },
        configure : {enabled : false},
        width : '100%',
        height : '100%',
        autoResize : true,
    };
    const nodeCount = data.nodes.length;
    const radius = 170;
    const center = {x : 0, y : 0};
    data.nodes.forEach((node, i) => {
        const angle = (i * 2 * Math.PI) / nodeCount - 7;
        node.x = center.x + radius * Math.cos(angle);
        node.y = center.y + radius * Math.sin(angle);
    });
    const network = new vis.Network(graphContainer, data, options);
    return {ui : data, network : network};
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
        input.style.backgroundColor = appColors.greenCell;
        input.style.cursor = 'not-allowed';
    });
}