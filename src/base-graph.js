function checkProbability(probability) {
    if (probability < 0 || probability > 1) {
        throw new Error("Вероятность должна быть от 0 до 1");
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
    probability = 0.5;
    edgeNumber = 0;
    sumWeights = 0;
    matrix = []
    constructor(size, probability, genType) {
        this.size = size;
        this.probability = probability;
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
            this.generateAssymetrical();
            break;
        case GraphGenerationType.ANTISYMMETRICAL:
            this.generateAntisymmetrical();
            break;
        default:
            throw new Error(`Unknown graph generation type: ${genType}`);
        }
    }

    generateDefault() {
        for (let i = 0; i != this.size; i++) {
            for (let j = 0; j != this.size; j++) {
                let result = checkProbability(this.probability);
                if (result) {
                    this.edgeNumber++;
                }
                this.matrix[i][j] = result;
            }
        }
    }

    generateSymmetrical() {
        for (let i = 0; i != this.size; i++) {
            for (let j = i; j < this.size; j++) {
                let result = checkProbability(this.probability);
                if (result) {
                    this.edgeNumber += 2;
                }
                this.matrix[i][j] = result;
                this.matrix[j][i] = result;
            }
        }
    }

    generateAntisymmetrical() {
        for (let i = 0; i != this.size; i++) {
            for (let j = i; j < this.size; j++) {
                let result = checkProbability(this.probability);
                if (result) {
                    this.edgeNumber++;
                }
                if (checkProbability(0.5)) {
                    this.matrix[j][i] = result;
                } else {
                    this.matrix[i][j] = result;
                }
            }
        }
    }

    generateAsymmetrical() {
        for (let i = 0; i != this.size; i++) {
            for (let j = i + 1; j < this.size; j++) {
                let result = checkProbability(this.probability);
                if (result) {
                    this.edgeNumber++;
                }
                if (checkProbability(0.5)) {
                    this.matrix[j][i] = result;
                } else {
                    this.matrix[i][j] = result;
                }
            }
        }
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
    }

    changeEdge(i, j, val) { this.matrix[i][j] = val; }
    get Matrix() { return this.Matrix; }
    get GenType() { return this.genType; }
    get EdgeNumber() { return this.edgeNumber; }
    printGraph() { console.log(this.matrix); }
}

function classicMatrixMultiply(first, second) {
    if (first[0].length !== second.length) {
        throw new Error(
            "Number of columns in first matrix must equal number of rows in second matrix");
    }
    new_matrix = [];
    for (let i = 0; i != first.length; i++) {
        new_row = [];
        for (let j = 0; j != first.length; j++) {
            temp = 0;
            for (let k = 0; k != first.length; k++) {
                temp += first[i][k] * second[k][j];
            }
            new_row.push(temp);
        }
        new_matrix.push(new_row);
    }
    return new_matrix;
};

function logicalMatrixMultiply(first, second) {
    if (first[0].length !== second.length) {
        throw new Error(
            "Number of columns in first matrix must equal number of rows in second matrix");
    }

    const new_matrix = [];
    const size = first.length;
    const innerSize = second[0].length;

    for (let i = 0; i < size; i++) {
        const new_row = [];
        for (let j = 0; j < innerSize; j++) {
            let temp = false;
            for (let k = 0; k < second.length; k++) {
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

function tropicalMatrixMultiply(first, second) {};

module.exports = {
    checkProbability,
    GraphGenerationType,
    Graph,
    classicMatrixMultiply,
    logicalMatrixMultiply,
    tropicalMatrixMultiply
};