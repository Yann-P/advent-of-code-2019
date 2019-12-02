#!/usr/bin/env node

const fs = require('fs')
const data = fs.readFileSync('./data/2_1.txt', { encoding: 'utf-8' })

let state = data.split(',').map(v=>+v)
//state = [1,9,10,3,2,3,11,0,99,30,40,50]

state[1] = 12
state[2] = 2

function applyOp(s, pos) {
	if(s[pos] == 99) {
		return true;
	}
	s[s[pos + 3]] = getOpFn(s[pos])(s[s[pos + 1]], s[s[pos + 2]])
}

function getOpFn(op) {
	switch(op) {
		case 1: return (x, y) => x + y;
		case 2: return (x, y) => x * y;
		default: throw new Error(`Unknown op ${op}`);
	}
}

for (let ptr = 0, end = false; ptr < state.length && !end; ptr += 4) {
	end = applyOp(state, ptr);
}

console.log(state)
