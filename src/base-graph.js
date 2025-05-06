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
    ANTISYMMETRICAL : 'ANTISYMM',
    UNKNOWN : 'UNKNOWN'
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

    clone(old_graph) {
        this.genType = old_graph.genType;
        this.size = old_graph.size;
        this.edgeNumber = old_graph.edgeNumber;
        this.sumWeights = old_graph.sumWeights;
        this.connectedComponents = old_graph.connectedComponents;
        this.matrix = old_graph.matrix.map(row => [...row]);
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
        while (edgesAdded < this.edgeNumber) {
            const i = Math.floor(Math.random() * this.size);
            const j = Math.floor(Math.random() * this.size);
            if (this.matrix[i][j] === 1)
                continue;

            this.matrix[i][j] = 1;
            this.matrix[j][i] = 1;
            edgesAdded++;
            if (i === j)
                continue;
            edgesAdded++;
        }
    }

    generateAntisymmetrical() {
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
        while (edgesAdded < this.edgeNumber) {
            const i = Math.floor(Math.random() * this.size);
            const j = Math.floor(Math.random() * this.size);
            if (i === j || this.matrix[i][j] === 1 || this.matrix[j][i] === 1)
                continue;

            this.matrix[i][j] = 1;
            edgesAdded++;
        }
    }
    neighbors(ind) {
        let result = [];
        for (let i = 0; i < this.matrix[ind].length; i++) {
            if (this.matrix[ind][i]) {
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
        let new_matrix = this.matrix.map(row => [...row]);
        for (let i = 1; i < power; i++) {
            new_matrix = classicMatrixMultiply(new_matrix, this.matrix);
        }
        this.matrix = new_matrix;
        this.genType = GraphGenerationType.UNKNOWN;
        this.edgeNumber = this.countEdges();
        this.sumWeights = this.countWeights();
        this.connectedComponents = this.findConnectedComponents();
    }

    logicalMultiply(power) {
        if (power < 1) {
            throw new Error("Bad power");
        }
        let new_matrix = this.matrix.map(row => [...row]);
        for (let i = 1; i < power; i++) {
            new_matrix = logicalMatrixMultiply(new_matrix, this.matrix);
        }
        this.matrix = new_matrix;
        this.genType = GraphGenerationType.UNKNOWN;
        this.edgeNumber = this.countEdges();
        this.sumWeights = this.countWeights();
        this.connectedComponents = this.findConnectedComponents();
    }

    tropicalMultiply(power) {
        if (power < 1) {
            throw new Error("Bad power");
        }
        let new_matrix = this.matrix.map(row => [...row]);
        for (let i = 1; i < power; i++) {
            new_matrix = tropicalMatrixMultiply(new_matrix, this.matrix);
        }
        this.matrix = new_matrix;
        this.genType = GraphGenerationType.UNKNOWN;
        this.edgeNumber = this.countEdges();
        this.sumWeights = this.countWeights();
        this.connectedComponents = this.findConnectedComponents();
    }

    changeEdge(i, j, val) { this.matrix[i][j] = val; }
    get Matrix() { return this.Matrix; }
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
    new_matrix = [];
    for (let i = 0; i != rows1; i++) {
        new_row = [];
        for (let j = 0; j != cols2; j++) {
            temp = 0;
            for (let k = 0; k != cols1; k++) {
                temp += first[i][k] * second[k][j];
            }
            new_row.push(temp);
        }
        new_matrix.push(new_row);
    }
    return new_matrix;
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

    const new_matrix = [];

    for (let i = 0; i < rows1; i++) {
        const new_row = [];
        for (let j = 0; j < cols2; j++) {
            let temp = false;
            for (let k = 0; k < cols1; k++) {
                if (first[i][k] && second[k][j]) {
                    temp = true;
                    break;
                }
            }
            new_row.push(temp ? 1 : 0);
        }
        new_matrix.push(new_row);
    }
    return new_matrix;
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
    const newMatrix =
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
