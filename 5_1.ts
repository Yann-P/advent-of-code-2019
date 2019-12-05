#!/usr/bin/env node

const fs = require('fs')
import * as _ from 'lodash'
const data = fs.readFileSync('./data/5_1.txt', { encoding: 'utf-8' })

let state = data.split(',').map(v=>+v)

type State = number[];

const modes = [0, 1] as const;
type Mode = typeof modes[number];

function nParams(opCode: number) {
	switch(opCode) {
		case 1: case 2: return 3;
		case 3: case 4: return 1;
		case 99: return 0;
		default: throw new Error(`unknown op ${opCode}`);
	}
}

function val(s: State, p: number, m: Mode): number {
	const res = m == 0 ? s[s[p]] : s[p];
	(typeof res === 'undefined') && console.trace(`val(s, ${p}, ${m}) is undefined`)
	return res;
}

function applyOp(s: State, pos: number, logger: number[]): number { // return last op length or -1 for end
	const fullOp = s[pos];
	(typeof fullOp === 'undefined') && console.trace(`No full op code at position ${pos}`);

	const [op, modes] = parseOpCode(fullOp);

	if(op == 3) {
		s[val(s, pos + 1, 1)] = 1
		return 2
	}
	if(op == 4) {
		logger.push(val(s, pos + 1, 0))
		return 2
	}
	if(op == 99) {
		return -1;
	}

	// + et *
	s[val(s, pos + 3, 1)] = getOpFn(op)(val(s, pos + 1, modes[0]), val(s, pos + 2, modes[1]))
	return 4
}

function getOpFn(op) {
	switch(op) {
		case 1: return (x, y) => x + y;
		case 2: return (x, y) => x * y;
		default: throw new Error(`Unknown op ${op}`);
	}
}

function run(state: State) {
	let logger = [];
	for (let ptr = 0, opLength = 4; ptr < state.length && opLength !== -1; ptr += opLength) {
		opLength = applyOp(state, ptr, logger);
	}
	return logger
}

function test(state: State, expectedOutput: number[], expectedState?: State) {
	if(!expectedState) {
		expectedState = _.clone(state); // expect didn't change
	}
	const output = run(state);
	console.log(_.isEqual(state, expectedState) ? true : `expected ${expectedState} got ${state}`, _.isEqual(output, expectedOutput) ? true : `expected ${expectedOutput} got ${output}`);
}

function getDigit(number: number, i: number): number {
    return Math.floor((number / Math.pow(10, i)) % 10);
}

function parseOpCode(fullOp: number): [number, Mode[]] {
	const op = getDigit(fullOp, 0) + getDigit(fullOp, 1) * 10
	const modes = []
	for (let i = 0; i < nParams(op); i++) {
		modes.push(getDigit(fullOp, 2 + i))
	}
	return [op, modes]
}

// TESTS
// output
test([4, 0, 99], [4])
test([4, 1, 99], [1])
// input
test([3, 0, 99], [], [1, 0, 99])
test([3, 3, 99, 9], [], [3, 3, 99, 1])
// outputs input
test([3,0,4,0,99], [1], [1, 0, 4, 0, 99])
// print (5 + 1)
test([1, 7, 8, 0, 4, 0, 99, 5, 1], [6], [6, 7, 8, 0, 4, 0, 99, 5, 1])

console.log(_.isEqual(parseOpCode(1002), [2, [0, 1, 0]]))
console.log(_.isEqual(parseOpCode(1102), [2, [1, 1, 0]]))

console.log(run(state))