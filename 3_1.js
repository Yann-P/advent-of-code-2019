#!/usr/bin/env node

const fs = require('fs')
const _ = require('lodash')
const data = fs.readFileSync('./data/3_1.txt', { encoding: 'utf-8' })

const moves = data.split('\n').slice(0, 2).map(arr => arr.split(','))

function getDirection(letter) {
	if(!['U', 'D', 'R', 'L'].includes(letter)) throw new Error('aah')
	return [...(({
	'U': [0, 1], 
	'D': [0, -1], 
	'R': [1, 0], 
	'L': [-1, 0]})[letter])]
}

function getDelta(move) {
	const res = /([UDRL])(\d+)/.exec(move)
	if(!res || res.length != 3) throw new Error('aaah');
	const letter = res[1]
	const number = +res[2]
	if(!Number.isFinite(number)) throw new Error('aaaah')
	return [getDirection(letter), number]
}

function getSteps(last, move) {
	const [direction, times] = getDelta(move)
	const res = []
	for(let i = 1; i <= times; i++)  {
		res.push(getStep(last, [direction[0] * i, direction[1] * i])) 
	}
	return res;
}

function getStep(last, delta) {
	return [last[0] + delta[0], last[1] + delta[1]];
}

function applyMove(wire, move) {
	const nexts = getSteps(wire[wire.length - 1], move)
	wire.push(...nexts)
	return nexts;
}

function manhattan(a, b) {
	return Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1])
}

// tests
let wire = [[1, 1]]
console.log(_.isEqual(getDirection('U'), [0, 1]))
console.log(_.isEqual(getDelta('L10'), [[-1, 0], 10]))
console.log(_.isEqual(getStep([2, 2], [1, 0]), [3, 2]))
console.log(_.isEqual(getSteps([1, 1], 'D3'), [[1, 0],[1, -1],[1, -2]]))
wire = [[1, 1]];

['R2'].forEach(move => applyMove(wire, move))
console.log(wire)
console.log(_.isEqual(wire, [[1, 1], [2, 1], [3, 1]]))

console.log(manhattan([0, 0], [1, 0]) == 1)

const wire1 = [[1, 1]];
moves[0].forEach(move => applyMove(wire1, move));
const wire2 = [[1, 1]];
const res = [];
moves[1].forEach(move => {
	const news = applyMove(wire2, move);
	for (const newPos of news) {
		let posWire1 = wire1.find(pos => pos[0] == newPos[0] && pos[1] == newPos[1])
		if(posWire1) {
			res.push(manhattan(newPos, [1, 1]));
		}		
	}
});	
console.log(Math.min(res));
