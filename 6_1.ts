#!/usr/bin/env node

const fs = require('fs')
import * as _ from 'lodash'
const read = (file: string): string[] => 
	fs.readFileSync(file, { encoding: 'utf-8' })
	.split('\n').filter(Boolean)
	.map((line: string) => line.split(')'))
	
const sample = read('./data/6_example.txt')
const data = read('./data/6_1.txt')


class Node { constructor(public name: string, public parent?: Node) {} }
class Graph {
	public nodes: Map<string, Node> = new Map;
	constructor(rootName: string) {
		this.nodes.set(rootName, new Node(rootName))
	}
	public addNode(name: string, parent: string) {
		const node = new Node(name, this.nodes.get(parent))
		this.nodes.set(name, node);
	} 
}


const graph = new Graph('COM')
for(const pair of data) {
	graph.addNode(pair[1], pair[0]);
}

let total = 0;
for(const key of [...graph.nodes.keys()]) {
	let count = 0;
	let node = graph.nodes.get(key);
	while(node) {
		node = node.parent;
		count++;
	}
	console.log(key, count)
	total += count - 1;
}

console.log(total)



//console.log(_.isEqual(state, expectedState) ? true : `expected ${expectedState} got ${state}`, _.isEqual(output, expectedOutput) ? true : `expected ${expectedOutput} got ${output}`);


console.log()