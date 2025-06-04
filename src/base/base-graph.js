/**
 * Перечисление типов генерации графа.
 */
const GraphGenerationType = Object.freeze({
    DEFAULT : 'DEFAULT',
    SYMMETRICAL : 'SYMM',
    ASYMMETRICAL : 'ASYMM',
    ANTISYMMETRICAL : 'ANTISYMM'
});

/**
 * Класс, представляющий граф с использованием матрицы смежности.
 *
 * @class Graph
 *
 * @property {string} genType - Тип генерации графа. Возможные значения:
 * 'DEFAULT', 'SPARSE', 'DENSE'.
 * @property {number} size - Количество вершин в графе.
 * @property {number} edgeNumber - Количество рёбер в графе.
 * @property {number} sumWeights - Сумма весов всех рёбер графа.
 * @property {number} connectedComponents - Количество компонент связности
 * графа.
 * @property {number[][]} matrix - Матрица смежности графа. matrix[i][j] — вес
 * ребра между вершинами i и j.
 *
 * @example
 * const graph = new Graph();
 * graph.size = 5;
 * graph.edgeNumber = 7;
 * graph.matrix = [
 *   [0, 2, 0, 0, 3],
 *   [2, 0, 1, 0, 0],
 *   [0, 1, 0, 4, 0],
 *   [0, 0, 4, 0, 5],
 *   [3, 0, 0, 5, 0]
 * ];
 */
class Graph {
    genType = 'DEFAULT';
    size = 0;
    edgeNumber = 0;
    sumWeights = 0;
    connectedComponents = 0;
    matrix = []
    /**
     * Конструктор графа.
     *
     * Инициализирует новый экземпляр графа с заданным размером, количеством
     * рёбер и типом генерации.
     *
     * @param {number} [size=0] - Количество вершин графа.
     * @param {number} [edgeNumber=0] - Количество рёбер графа.
     * @param {GraphGenerationType} [genType=GraphGenerationType.DEFAULT] - Тип
     *     генерации графа.
     */
    constructor(size, edgeNumber, genType = GraphGenerationType.DEFAULT) {
        if (size == undefined) {
            this.size = 0;
            this.matrix = [];
            this.genType = GraphGenerationType.DEFAULT;
            return;
        }
        this.size = size;
        this.edgeNumber = edgeNumber;
        this.genType = genType;
        this.connectedComponents = 0;
        while (this.connectedComponents != 1) {
            this.matrix = Array.from({length : this.size},
                                     () => new Array(this.size).fill(0));
            switch (genType) {
            case GraphGenerationType.DEFAULT:
                this.generateDefault();
                break;
            case GraphGenerationType.SYMMETRICAL:
                this.generateSymmetrical();
                break;
            case GraphGenerationType.ASYMMETRICAL:
                this.generateAsymmetrical();
                break;
            case GraphGenerationType.ANTISYMMETRICAL:
                this.generateAntisymmetrical();
                break;
            default:
                throw new Error(`Unknown graph generation type: ${genType}`);
            }
            this.connectedComponents = this.findConnectedComponents();
        }
    }

    /**
     * Копирует данные из другого графа в текущий экземпляр.
     *
     * Клонирует:
     * - тип генерации,
     * - размер графа,
     * - количество рёбер,
     * - сумму весов,
     * - количество компонент связности,
     * - матрицу смежности (с глубоким копированием).
     *
     * @param {Graph} oldGraph - Экземпляр графа, данные которого будут
     *     скопированы.
     * @returns {void}
     *
     * @example
     * const graph1 = new Graph();
     * // ...заполнение graph1
     * const graph2 = new Graph();
     * graph2.clone(graph1); // Теперь graph2 содержит копию данных graph1
     */
    clone(oldGraph) {
        this.genType = oldGraph.genType;
        this.size = oldGraph.size;
        this.edgeNumber = oldGraph.edgeNumber;
        this.sumWeights = oldGraph.sumWeights;
        this.connectedComponents = oldGraph.connectedComponents;
        this.matrix = oldGraph.matrix.map(row => [...row]);
    }

    /**
     * Находит количество компонент связности в графе с использованием поиска в
     * ширину (BFS).
     *
     * @returns {number} Количество компонент связности.
     *
     * @example
     * const graph = new Graph();
     * // ...заполнение графа
     * const components = graph.findConnectedComponents(); // Например: 2
     */
    findConnectedComponents() {
        if (this.size === 0) {
            return 0;
        }
        const nodes = new Set();
        for (let i = 0; i < this.size; i++) {
            nodes.add(i);
        }
        let components = 0;
        while (nodes.size > 0) {
            const firstNode = nodes.values().next().value;
            const visitedNodes = BFS(this, firstNode);
            for (const node of visitedNodes) {
                nodes.delete(node);
            }
            components++;
        }
        return components;
    }

    /**
     * Генерирует граф по умолчанию, заполняя матрицу смежности случайными
     * рёбрами.
     *
     * Метод случайным образом выбирает позиции в матрице и добавляет туда рёбра
     * (значение 1), пока не будет достигнуто заданное количество рёбер
     * (`this.edgeNumber`).
     *
     * @returns {void}
     *
     * @example
     * const graph = new Graph();
     * graph.size = 5;
     * graph.edgeNumber = 7;
     * graph.generateDefault(); // Теперь матрица содержит 7 случайных рёбер
     */
    generateDefault() {
        let edgesAdded = 0;

        while (edgesAdded < this.edgeNumber) {
            const i = Math.floor(Math.random() * this.size);
            const j = Math.floor(Math.random() * this.size);
            if (this.matrix[i][j] == 1)
                continue;

            this.matrix[i][j] = 1;
            edgesAdded++;
        }
    }

    /**
     * Генерирует симметричный граф, добавляя рёбра в обе стороны (матрица
     * становится симметричной).
     *
     * Метод случайным образом выбирает позиции в матрице и добавляет туда рёбра
     * (значение 1), обеспечивая, чтобы ребро i-j и j-i были равны, пока не
     * будет достигнуто нужное количество рёбер.
     *
     * @returns {void}
     *
     * @example
     * const graph = new Graph();
     * graph.size = 5;
     * graph.edgeNumber = 7;
     * graph.genType = GraphGenerationType.SYMMETRICAL;
     * graph.generateSymmetrical(); // Теперь матрица содержит 7 симметричных
     * рёбер
     */
    generateSymmetrical() {
        let edgesAdded = 0;
        while (edgesAdded < this.edgeNumber) {
            const i = Math.floor(Math.random() * this.size);
            const j = Math.floor(Math.random() * this.size);
            if (this.matrix[i][j] == 1)
                continue;

            this.matrix[i][j] = 1;
            this.matrix[j][i] = 1;
            edgesAdded++;
        }
    }

    /**
     * Генерирует антисимметричный граф, где наличие ребра i→j исключает наличие
     * ребра j→i.
     *
     * Метод случайным образом добавляет рёбра в матрицу смежности так, чтобы
     * соблюдалось свойство антисимметричности: если есть ребро i→j, то ребра
     * j→i быть не должно.
     *
     * @returns {void}
     *
     * @example
     * const graph = new Graph();
     * graph.size = 5;
     * graph.edgeNumber = 7;
     * graph.genType = GraphGenerationType.ANTISYMMETRICAL;
     * graph.generateAntisymmetrical(); // Теперь матрица содержит 7
     * антисимметричных рёбер
     */
    generateAntisymmetrical() {
        let edgesAdded = 0;
        while (edgesAdded < this.edgeNumber) {
            const i = Math.floor(Math.random() * this.size);
            const j = Math.floor(Math.random() * this.size);
            if (this.matrix[i][j] == 1 || this.matrix[j][i] == 1)
                continue;

            this.matrix[i][j] = 1;
            edgesAdded++;
        }
    }

    /**
     * Генерирует асимметричный граф, исключая наличие обратных рёбер и петель.
     *
     * Метод случайным образом добавляет рёбра в матрицу смежности так, чтобы:
     * - не было петель (i !== j),
     * - не существовало обратного ребра (если i→j, то j→i быть не должно).
     *
     * @returns {void}
     *
     * @example
     * const graph = new Graph();
     * graph.size = 5;
     * graph.edgeNumber = 7;
     * graph.genType = GraphGenerationType.ASYMMETRICAL;
     * graph.generateAsymmetrical(); // Теперь матрица содержит 7 асимметричных
     * рёбер
     */
    generateAsymmetrical() {
        let edgesAdded = 0;
        while (edgesAdded < this.edgeNumber) {
            const i = Math.floor(Math.random() * this.size);
            const j = Math.floor(Math.random() * this.size);
            if (i == j || this.matrix[i][j] == 1 || this.matrix[j][i] == 1)
                continue;

            this.matrix[i][j] = 1;
            edgesAdded++;
        }
    }

    /**
     * Возвращает список соседних вершин для указанной вершины.
     *
     * Соседом считается любая вершина, с которой есть связь (значение в матрице
     * !== 0).
     *
     * @param {number} idx - Индекс вершины, для которой ищутся соседи.
     * @returns {number[]} Массив индексов соседних вершин.
     *
     * @example
     * const graph = new Graph();
     * // ...заполнение графа
     * const neighbors = graph.neighbors(2); // Например: [0, 3]
     */
    neighbors(idx) {
        let result = [];
        for (let i = 0; i < this.matrix[idx].length; i++) {
            if (this.matrix[idx][i]) {
                result.push(i);
            }
        }
        return result;
    }
    /**
     * Подсчитывает количество рёбер в ориентированном графе.
     *
     *
     * @returns {number} Количество уникальных рёбер.
     */
    countEdges() {
        let edgeNumber = 0;
        for (let row of this.matrix) {
            for (let element of row) {
                if (element) {
                    edgeNumber++;
                }
            }
        }
        return edgeNumber;
    }

    /**
     * Подсчитывает сумму весов всех рёбер графа на основе матрицы смежности.
     *
     * Каждая ненулевая ячейка матрицы считается как вес ребра. В
     * ориентированном графе это соответствует отдельной дуге. В
     * неориентированном графе каждое ребро будет учтено дважды.
     *
     * @returns {number} Сумма весов всех рёбер графа.
     *
     * @example
     * const graph = new Graph();
     * // ...заполнение графа
     * const totalWeight = graph.countWeights(); // Например: 25
     */
    countWeights() {
        let sumWeights = 0;
        for (let row of this.matrix) {
            for (let element of row) {
                if (element) {
                    sumWeights += element;
                }
            }
        }
        return sumWeights;
    }

    /**
     * Возводит матрицу смежности графа в заданную степень с использованием
     * классического умножения матриц.
     *
     * После возведения матрица графа обновляется, а также пересчитываются:
     * - количество рёбер,
     * - сумма весов,
     * - количество компонент связности,
     * - тип графа.
     *
     * @param {number} power - Степень, в которую нужно возвести матрицу (должна
     *     быть ≥ 1).
     * @returns {void}
     *
     * @throws {Error} Если степень меньше 1.
     *
     * @example
     * const graph = new Graph();
     * // ...заполнение графа
     * graph.classicMultiply(3); // Теперь матрица — результат трёхкратного
     * умножения самой на себя
     */
    classicMultiply(power) {
        if (power < 1) {
            throw new Error("Bad power");
        }
        let newMatrix = this.matrix.map(row => [...row]);
        for (let i = 1; i < power; i++) {
            newMatrix = classicMatrixMultiply(newMatrix, this.matrix);
        }
        this.matrix = newMatrix;
        this.edgeNumber = this.countEdges();
        this.sumWeights = this.countWeights();
        this.connectedComponents = this.findConnectedComponents();
        this.genType = this.defineType();
    }
    /**
     * Возводит матрицу смежности графа в заданную степень с использованием
     * логического умножения матриц.
     *
     * Логическое умножение используется для определения достижимости между
     * вершинами:
     * - 1 означает наличие пути,
     * - 0 — отсутствие пути.
     *
     * После возведения матрица графа обновляется, а также пересчитываются:
     * - количество рёбер,
     * - сумма весов,
     * - количество компонент связности,
     * - тип графа.
     *
     * @param {number} power - Степень, в которую нужно возвести матрицу (должна
     *     быть ≥ 1).
     * @returns {void}
     *
     * @throws {Error} Если степень меньше 1.
     *
     * @example
     * const graph = new Graph();
     * // ...заполнение графа
     * graph.logicalMultiply(2); // Теперь матрица содержит информацию о
     * достижимости за 2 шага
     */
    logicalMultiply(power) {
        if (power < 1) {
            throw new Error("Bad power");
        }
        let newMatrix = this.matrix.map(row => [...row]);
        for (let i = 1; i < power; i++) {
            newMatrix = logicalMatrixMultiply(newMatrix, this.matrix);
        }
        this.matrix = newMatrix;
        this.edgeNumber = this.countEdges();
        this.sumWeights = this.countWeights();
        this.connectedComponents = this.findConnectedComponents();
        this.genType = this.defineType();
    }

    /**
     * Возводит матрицу смежности графа в заданную степень с использованием
     * тропического умножения матриц.
     *
     * Тропическое умножение используется для поиска кратчайших путей в графе:
     * - Сложение заменяется на минимум,
     * - Умножение заменяется на сложение.
     *
     * После возведения матрица графа обновляется, а также пересчитываются:
     * - количество рёбер,
     * - сумма весов,
     * - количество компонент связности,
     * - тип графа.
     *
     * @param {number} power - Степень, в которую нужно возвести матрицу (должна
     *     быть ≥ 1).
     * @returns {void}
     *
     * @throws {Error} Если степень меньше 1.
     *
     * @example
     * const graph = new Graph();
     * // ...заполнение графа с весами
     * graph.tropicalMultiply(2); // Теперь матрица содержит длины кратчайших
     * //путей за 2 шага
     */
    tropicalMultiply(power) {
        if (power < 1) {
            throw new Error("Bad power");
        }
        let newMatrix = this.matrix.map(row => [...row]);
        for (let i = 1; i < power; i++) {
            newMatrix = tropicalMatrixMultiply(newMatrix, this.matrix);
        }
        this.matrix = newMatrix;
        this.edgeNumber = this.countEdges();
        this.sumWeights = this.countWeights();
        this.connectedComponents = this.findConnectedComponents();
        this.genType = this.defineType();
    }

    /**
     * Определяет тип графа на основе анализа матрицы смежности.
     *
     * Проверяет, является ли граф:
     * - симметричным (если matrix[i][j] === matrix[j][i]),
     * - антисимметричным (если matrix[i][j] === 1 && matrix[j][i] === 0 для i ≠
     * j),
     * - асимметричным (отсутствие петель и только односторонние рёбра).
     *
     * @returns {GraphGenerationType} Тип графа: 'SYMM', 'ANTISYMM', 'ASYMM' или
     *     'DEFAULT'.
     *
     * @example
     * const graph = new Graph();
     * // ...заполнение графа
     * const type = graph.defineType(); // Например:
     * GraphGenerationType.SYMMETRICAL
     */
    defineType() {
        let symmetrical = true;
        let antiSymmetrical = true;
        let asymmetrical = true;
        for (let y = 0; y != this.size; y++) {
            for (let x = 0; x != y + 1; x++) {
                if (y == x && this.matrix[y][x]) {
                    asymmetrical = false;
                }
                if (y != x && this.matrix[y][x] == this.matrix[x][y]) {
                    antiSymmetrical = false;
                }
                if (this.matrix[y][x] != this.matrix[x][y]) {
                    symmetrical = false;
                }
                if (!antiSymmetrical && !symmetrical && !asymmetrical) {
                    return GraphGenerationType.DEFAULT;
                }
            }
        }
        if (symmetrical) {
            return GraphGenerationType.SYMMETRICAL;
        } else if (antiSymmetrical) {
            return GraphGenerationType.ANTISYMMETRICAL;
        } else if (asymmetrical) {
            return GraphGenerationType.ASYMMETRICAL;
        }
        return GraphGenerationType.DEFAULT;
    }
    /**
     * Изменяет значение ребра между вершинами i и j.
     *
     * @param {number} i - Индекс начальной вершины.
     * @param {number} j - Индекс конечной вершины.
     * @param {number} val - Новое значение ребра (например, вес или 0 для
     *     удаления).
     */
    changeEdge(i, j, val) { this.matrix[i][j] = val; }

    /**
     * Возвращает матрицу смежности графа.
     *
     * @type {number[][]}
     */
    get Matrix() { return this.matrix; }

    /**
     * Возвращает тип генерации графа.
     *
     * @type {string}
     */
    get GenType() { return this.genType; }

    /**
     * Возвращает количество рёбер в графе.
     *
     * @type {number}
     */
    get EdgeNumber() { return this.edgeNumber; }

    /**
     * Возвращает сумму весов всех рёбер графа.
     *
     * @type {number}
     */
    get SumWeights() { return this.sumWeights; }

    /**
     * Выводит матрицу графа в консоль.
     */
    printGraph() { console.log(this.matrix); }
}

function classicMatrixMultiply(first, second) {
    let rows1 = first.length;
    let cols1 = first[0].length;
    let rows2 = second.length;
    let cols2 = second[0].length;
    if (cols1 !== rows2) {
        throw new Error(
            "Number of columns in first matrix must equal number of rows in second matrix");
    }
    let newMatrix = [];
    for (let i = 0; i != rows1; i++) {
        let newRow = [];
        for (let j = 0; j != cols2; j++) {
            let temp = 0;
            for (let k = 0; k != cols1; k++) {
                temp += first[i][k] * second[k][j];
            }
            newRow.push(temp);
        }
        newMatrix.push(newRow);
    }
    return newMatrix;
};

function logicalMatrixMultiply(first, second) {
    let rows1 = first.length;
    let cols1 = first[0].length;
    let rows2 = second.length;
    let cols2 = second[0].length;
    if (cols1 !== rows2) {
        throw new Error(
            "Number of columns in first matrix must equal number of rows in second matrix");
    }

    let newMatrix = [];
    for (let i = 0; i < rows1; i++) {
        let newRow = [];
        for (let j = 0; j < cols2; j++) {
            let temp = false;
            for (let k = 0; k < cols1; k++) {
                if (first[i][k] && second[k][j]) {
                    temp = true;
                    break;
                }
            }
            newRow.push(temp ? 1 : 0);
        }
        newMatrix.push(newRow);
    }
    return newMatrix;
}

function tropicalMatrixMultiply(first, second) {
    let rows1 = first.length;
    let cols1 = first[0].length;
    let rows2 = second.length;
    let cols2 = second[0].length;
    if (cols1 != rows2) {
        throw new Error(
            "Number of columns in first matrix must equal number of rows in second matrix");
    }
    let newMatrix =
        new Array(rows1).fill().map(() => new Array(cols2).fill(-Infinity));

    for (let i = 0; i < rows1; i++) {
        for (let j = 0; j < cols2; j++) {
            for (let k = 0; k < cols1; k++) {
                const firstVal = first[i][k] === 0 ? -Infinity : first[i][k];
                const secondVal = second[k][j] === 0 ? -Infinity : second[k][j];

                newMatrix[i][j] =
                    Math.max(newMatrix[i][j], firstVal + secondVal);
            }
            newMatrix[i][j] =
                newMatrix[i][j] === -Infinity ? 0 : newMatrix[i][j];
        }
    }
    return newMatrix;
};

/**
 * Выполняет поиск в ширину (BFS) из указанной стартовой вершины графа.
 *
 * Возвращает множество индексов всех посещённых вершин (достижимых из
 * стартовой).
 *
 * @param {Graph} graph - Граф, в котором выполняется обход.
 * @param {number} startIndex - Индекс стартовой вершины для начала поиска.
 * @returns {Set<number>} Множество индексов посещённых вершин.
 *
 * @example
 * const visited = BFS(graph, 0);
 * console.log([...visited]); // Например: [0, 1, 3, 4]
 */
function BFS(graph, startIndex) {
    const visited = new Set();
    const toVisit = [ startIndex ];

    while (toVisit.length > 0) {
        const nodeIndex = toVisit.shift();

        if (!visited.has(nodeIndex)) {
            visited.add(nodeIndex);

            const neighbors = graph.neighbors(nodeIndex);
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    toVisit.push(neighbor);
                }
            }
        }
    }
    return visited;
}

export {
    GraphGenerationType,
    Graph,
    classicMatrixMultiply,
    logicalMatrixMultiply,
    tropicalMatrixMultiply,
    BFS
};
