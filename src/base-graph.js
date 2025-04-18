function checkProbability(probability) {
    if (probability < 0 || probability > 1) {
        throw new Error("Вероятность должна быть от 0 до 1");
    }
    return Math.random() < probability ? 1 : 0;
}

class Graph {
    gen_type = 'DEFAULT';
    size = 0;
    probability = 0.5;
    matrix = []
    constructor(size, probability, gen_type) {
        this.size = size;
        this.probability = probability;
        this.gen_type = gen_type;
        this.matrix = Array.from({length : this.size},
                                 () => new Array(this.size).fill(0));
        if (gen_type === 'DEFAULT') {
            this.generate_default();
        } else if (gen_type === 'SYMM') {
            this.generate_symmetrical();
        } else if (gen_type === 'ASYMM') {
            this.generate_assymetrical();
        } else if (gen_type === 'ANTISYMM') {
            this.generate_antisymmetrical();
        }
    }
    generate_default() {
        console.log("default");
        for (let i = 0; i != this.size; i++) {
            for (let j = 0; j != this.size; j++) {
                let result = checkProbability(this.probability);
                this.matrix[i][j] = result;
            }
        }
    }
    generate_symmetrical() {
        for (let i = 0; i != this.size; i++) {
            for (let j = i; j < this.size; j++) {
                let result = checkProbability(this.probability);
                this.matrix[i][j] = result;
                this.matrix[j][i] = result;
            }
        }
    }
    generate_antisymmetrical() {
        for (let i = 0; i != this.size; i++) {
            for (let j = i; j < this.size; j++) {
                let result = checkProbability(this.probability);
                if (checkProbability(0.5)) {
                    this.matrix[j][i] = result;
                } else {
                    this.matrix[i][j] = result;
                }
            }
        }
    }
    generate_assymetrical() {
        for (let i = 0; i != this.size; i++) {
            for (let j = i + 1; j < this.size; j++) {
                let result = checkProbability(this.probability);
                if (checkProbability(0.5)) {
                    this.matrix[j][i] = result;
                } else {
                    this.matrix[i][j] = result;
                }
            }
        }
    }
    print_graph() { console.log(this.matrix); }
}

let be = new Graph(5, 1, 'ASYMM');
be.print_graph();