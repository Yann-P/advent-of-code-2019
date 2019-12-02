#!/usr/bin/env node

const fs = require('fs')
const data = fs.readFileSync('./data/2_1.txt', { encoding: 'utf-8' })

let state = data.split(',').map(v=>+v)

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

function run(state, noun, verb) {
	state[1] = noun
	state[2] = verb
	for (let ptr = 0, end = false; ptr < state.length && !end; ptr += 4) {
		end = applyOp(state, ptr);
	}
	return state[0]
}

for(let i = 0; i < 99; i++) {
	for(let j=0;j<99;j++) {
		let s = [...state]
		let res = run(s, i, j);
		if(res==19690720) {
			console.log( [i,j] )
			return;
		}
	}
}

console.log(state)
