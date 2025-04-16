class Node{
    constructor(name, id){
        this.name = name;
        this.id = id;
        this.neighbor_ids = [];
    }
    addNeighbor(id){
        this.neighbor_ids.push(id);
    }
}



class Graph{
    constructor(){
        this.nodes = [];
        this.matrix = [];
    }
    getList(){
        return this.adjList;
    }
    addNode(node, neighbors){
        for(let neighbor of neighbors){
            node.addNeighbor(neighbor);
        }
        this.nodes.push(node);
    }
    addNeigbors(id, neighbor_ids){
        node[id].neighbor_ids = neighbor_ids;
    }
    printGraph(){
        this.nodes.forEach(node => {
            console.log(node);
        });
    }
}

let graph = new Graph();
let node1 = new Node("Vadim", 1);
let node2 = new Node("Nastya", 2);
let node3 = new Node("Sanya", 3);
let node4 = new Node("Kirill", 4);
graph.addNode(node1, [2, 3, 4]);
graph.addNode(node2, [1]);
graph.addNode(node3, [1, 4]);
graph.addNode(node4, [1, 3]);
graph.printGraph();

