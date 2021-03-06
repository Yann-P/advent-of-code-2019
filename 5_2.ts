#!/usr/bin/env node

const fs = require('fs')
import * as _ from 'lodash'
const data = fs.readFileSync('./data/5_1.txt', { encoding: 'utf-8' })

// PUZZLE INPUT
let state = data.split(',').map((v: string)=>+v)
const INPUT = 5

type State = number[];
const modes = [0, 1] as const;
type Mode = typeof modes[number];

function nParams(opCode: number) {
	switch(opCode) {
		case 1: case 2: case 7: case 8: return 3;
		case 3: case 4: return 1;
		case 5: case 6: return 2;
		case 99: return 0;
		default: throw new Error(`unknown op ${opCode}`);
	}
}

function getValue(s: State, p: number, m: Mode): number {
	const res = m == 0 ? s[s[p]] : s[p];
	(typeof res === 'undefined') && console.trace(`getValue(s, ${p}, ${m}) is undefined`)
	return res;
}

function applyOp(state: State, pos: number, logger: number[]): { length: number; jump?: number, end?: boolean} { // return last op length or -1 for end
	const fullOp = state[pos];
	(typeof fullOp === 'undefined') && console.trace(`No full op code at position ${pos}`);

	const [op, modes] = parseOpCode(fullOp);

	const val = (i: number, mode?: Mode) => getValue(state, pos + i, typeof mode !== 'undefined' ? mode : modes[i - 1]);
	const set = (i: number, v: number) => state[val(i, 1)] = v;

	switch(op) { 
	case 3: // input
		set(1, INPUT)
		return { length: 2 }
	case 4: // output
		logger.push(val(1))
		return { length: 2 }
	case 5: // jump if true
		if(val(1) !== 0) {
			return { length: 3, jump: val(2) }
		}
		return { length: 3 }
	case 6: // jump if false
		if(val(1) === 0) {
			return { length: 3, jump: val(2) }
		}
		return { length: 3 }
	case 99:
		return { length: 1, end: true }
	default: // <, ===, + et *
		set(3, getOpFn(op)(val(1), val(2)))
		return { length: 4 }
	}
}

function getOpFn(op: number) {
	switch(op) {
		case 1: return (x: number, y: number) => x + y;
		case 2: return (x: number, y: number) => x * y;
		case 7: return (x: number, y: number) => +(x<y)
		case 8: return (x: number, y: number) => +(x===y)
		default: throw new Error(`Unknown op ${op}`);
	}
}

function run(state: State) {
	let logger: number[] = [];
	let length: number;
	let jump: number | undefined;
	let end: boolean | undefined;
	for (let ptr = 0; ptr < state.length && end !== true; ptr += length) {
		({ length, end, jump } = applyOp(state, ptr, logger));
		if (typeof jump !== "undefined") {
			ptr = jump;
			length = 0;
		}
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
	const modes: Mode[] = []
	for (let i = 0; i < nParams(op); i++) {
		const digit = getDigit(fullOp, 2 + i);
		if(![0, 1].includes(digit)) throw new Error(`mode not 0 or 1`);
		modes.push(digit as Mode)
	}
	return [op, modes]
}

// TESTS
// output
test([4, 0, 99], [4])
test([4, 1, 99], [1])
test([104, 666], [666]) // by value
// input
test([3, 0, 99], [], [INPUT, 0, 99])
test([3, 3, 99, 9], [], [3, 3, 99, INPUT])
// outputs input
test([3,0,4,0,99], [INPUT], [INPUT, 0, 4, 0, 99])
// print (5 + 1)
test([1, 7, 8, 0, 4, 0, 99, 5, 1], [6], [6, 7, 8, 0, 4, 0, 99, 5, 1])

console.log(_.isEqual(parseOpCode(1002), [2, [0, 1, 0]]))
console.log(_.isEqual(parseOpCode(1102), [2, [1, 1, 0]]))

// jump if true check by printing 666
test([1105, 2, 4, 99, 104, 666, 99], [666], [1105, 2, 4, 99, 104, 666, 99]) // jump by value, print by value
test([1105, 0, 4, 99, 104, 666, 99], [], 	[1105, 0, 4, 99, 104, 666, 99]) // does NOT jump if NOT true

// jump if false check by printing 666
test([1106, 0, 4, 99, 104, 666, 99], [666], [1106, 0, 4, 99, 104, 666, 99]) // jump by value, print by value
test([1106, 4, 4, 99, 104, 666, 99], [], 	[1106, 4, 4, 99, 104, 666, 99]) // does NOT jump if true

console.log(run(state))