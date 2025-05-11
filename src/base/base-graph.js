function checkProbability(probability) {
    if (probability < 0 || probability > 1) {
        throw new Error("Probability must be between 0 and 1");
    }
    return Math.random() < probability ? 1 : 0;
}

const GraphGenerationType = Object.freeze({
    DEFAULT : 'DEFAULT',
    SYMMETRICAL : 'SYMM',
    ASYMMETRICAL : 'ASYMM',
    ANTISYMMETRICAL : 'ANTISYMM'
});

class Graph {
    genType = 'DEFAULT';
    size = 0;
    edgeNumber = 0;
    sumWeights = 0;
    connectedComponents = 0;
    matrix = []
    constructor(size = 0, edgeNumber = 0,
                genType = GraphGenerationType.DEFAULT) {
        this.size = size;
        this.edgeNumber = edgeNumber;
        this.genType = genType;
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

    clone(oldGraph) {
        this.genType = oldGraph.genType;
        this.size = oldGraph.size;
        this.edgeNumber = oldGraph.edgeNumber;
        this.sumWeights = oldGraph.sumWeights;
        this.connectedComponents = oldGraph.connectedComponents;
        this.matrix = oldGraph.matrix.map(row => [...row]);
    }

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

    generateDefault() {
        let edgesAdded = 0;

        while (edgesAdded < this.edgeNumber) {
            const i = Math.floor(Math.random() * this.size);
            const j = Math.floor(Math.random() * this.size);
            if (this.matrix[i][j] === 1)
                continue;

            this.matrix[i][j] = 1;
            edgesAdded++;
        }
    }

    generateSymmetrical() {
        let edgesAdded = 0;
        while (edgesAdded < this.edgeNumber) {
            const i = Math.floor(Math.random() * this.size);
            const j = Math.floor(Math.random() * this.size);
            if (this.matrix[i][j] === 1)
                continue;

            this.matrix[i][j] = 1;
            this.matrix[j][i] = 1;
            edgesAdded++;
        }
    }

    generateAntisymmetrical() {
        let edgesAdded = 0;
        while (edgesAdded < this.edgeNumber) {
            const i = Math.floor(Math.random() * this.size);
            const j = Math.floor(Math.random() * this.size);
            if (this.matrix[i][j] === 1 || this.matrix[j][i] === 1)
                continue;

            this.matrix[i][j] = 1;
            edgesAdded++;
        }
    }

    generateAsymmetrical() {
        let edgesAdded = 0;
        while (edgesAdded < this.edgeNumber) {
            const i = Math.floor(Math.random() * this.size);
            const j = Math.floor(Math.random() * this.size);
            if (i === j || this.matrix[i][j] === 1 || this.matrix[j][i] === 1)
                continue;

            this.matrix[i][j] = 1;
            edgesAdded++;
        }
    }

    neighbors(idx) {
        let result = [];
        for (let i = 0; i < this.matrix[idx].length; i++) {
            if (this.matrix[idx][i]) {
                result.push(i);
            }
        }
        return result;
    }

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

    changeEdge(i, j, val) { this.matrix[i][j] = val; }
    get Matrix() { return this.matrix; }
    get GenType() { return this.genType; }
    get EdgeNumber() { return this.edgeNumber; }
    get SumWeights() { return this.sumWeights; }
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
        new Array(rows1).fill().map(() => new Array(cols2).fill(Infinity));

    for (let i = 0; i < rows1; i++) {
        for (let j = 0; j < cols2; j++) {
            for (let k = 0; k < cols1; k++) {
                const firstVal = first[i][k] === 0 ? Infinity : first[i][k];
                const secondVal = second[k][j] === 0 ? Infinity : second[k][j];

                newMatrix[i][j] =
                    Math.min(newMatrix[i][j], firstVal + secondVal);
            }
            newMatrix[i][j] =
                newMatrix[i][j] === Infinity ? 0 : newMatrix[i][j];
        }
    }
    return newMatrix;
};

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
    checkProbability,
    GraphGenerationType,
    Graph,
    classicMatrixMultiply,
    logicalMatrixMultiply,
    tropicalMatrixMultiply,
    BFS
};
