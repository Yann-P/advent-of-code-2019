#!/usr/bin/env node

const fs = require('fs')
import * as _ from 'lodash'

const getState = (file: string) => fs.readFileSync(file, { encoding: 'utf-8' }).split(',').map((v: string)=>+v)

const dataDay5 = getState('./data/5_1.txt')
const dataDay9 = getState('./data/9_1.txt')

type State = number[];
const modes = [0, 1, 2] as const;
type Mode = typeof modes[number];

function nParams(opCode: number) {
	switch(opCode) {
		case 1: case 2: case 7: case 8: return 3;
		case 3: case 4: case 9: return 1;
		case 5: case 6: return 2;
		case 99: return 0;
		default: throw new Error(`unknown op ${opCode}`);
	}
}

function getValue(s: State, p: number, m: Mode, relBase: number): number {
	let res;
	switch(m) {
		case 0: 
			res = s[s[p]]; break;
		case 1: 
			res = s[p]; break;
		case 2: 
			res = s[s[p] + relBase]; break;
		default: throw "unknown mode"
	}
	if (typeof res === 'undefined') return 0; // && console.trace(`getValue(s, pos=${p}, mode=${m}) is undefined`)
	return res;
}

function applyOp(input: number, state: State, pos: number, logger: number[], relBase: number): { length: number; jump?: number, end?: boolean, relBase: number} { // return last op length or -1 for end
	const fullOp = state[pos];
	(typeof fullOp === 'undefined') && console.trace(`No full op code at position ${pos}`);

	const [op, modes] = parseOpCode(fullOp);

	const val = (i: number, mode?: Mode) => getValue(state, pos + i, typeof mode !== 'undefined' ? mode : modes[i - 1], relBase);
	const set = (i: number, v: number) => {
		if(modes[i - 1] == 2) {
			state[state[pos + i] + relBase] = v;
		} else {
			state[val(i, 1)] = v;
		}
	}

	switch(op) { 
	case 3: // input
		set(1, input)
		return { length: 2, relBase }
	case 4: // output
		logger.push(val(1))
		return { length: 2, relBase }
	case 5: // jump if true
		if(val(1) !== 0) {
			return { length: 0, jump: val(2), relBase }
		}
		return { length: 3, relBase }
	case 6: // jump if false
		if(val(1) === 0) {
			return { length: 0, jump: val(2), relBase }
		}
		return { length: 3, relBase }
	case 9:
		return { length: 2, relBase: relBase + val(1)}
	case 99:
		return { length: 1, end: true, relBase }
	default: // <, ===, + et *
		set(3, getOpFn(op)(val(1), val(2)))
		return { length: 4, relBase }
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

function run(input: number, state: State) {
	let logger: number[] = [];
	let length: number;
	let relBase = 0;
	let jump: number | undefined;
	let end: boolean | undefined;
	for (let ptr = 0; ptr < state.length && end !== true; ptr += length) {
		({ length, end, jump, relBase } = applyOp(input, state, ptr, logger, relBase));
		if (typeof jump !== "undefined") {
			ptr = jump;
		}
	}
	return logger
}

function test(input: number, state: State, expectedOutput: number[], expectedState?: State) {
	if(!expectedState) {
		expectedState = _.clone(state); // expect didn't change
	}
	const output = run(input, state);
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
		if(![0, 1, 2].includes(digit)) throw new Error(`mode not 0 or 1`);
		modes.push(digit as Mode)
	}
	return [op, modes]
}

// TESTS
// output
test(5, [4, 0, 99], [4])
test(5, [4, 1, 99], [1])
test(5, [104, 666], [666]) // by value
// input
let input = 5;
test(input, [3, 0, 99], [], [input, 0, 99])
test(input, [3, 3, 99, 9], [], [3, 3, 99, input])
// outputs input
test(input, [3,0,4,0,99], [input], [input, 0, 4, 0, 99])
// print (5 + 1)
test(5, [1, 7, 8, 0, 4, 0, 99, 5, 1], [6], [6, 7, 8, 0, 4, 0, 99, 5, 1])

console.log(_.isEqual(parseOpCode(1002), [2, [0, 1, 0]]))
console.log(_.isEqual(parseOpCode(1102), [2, [1, 1, 0]]))

// jump if true check by printing 666
test(5, [1105, 2, 4, 99, 104, 666, 99], [666], [1105, 2, 4, 99, 104, 666, 99]) // jump by value, print by value
test(5, [1105, 0, 4, 99, 104, 666, 99], [], 	[1105, 0, 4, 99, 104, 666, 99]) // does NOT jump if NOT true

// jump if false check by printing 666
test(5, [1106, 0, 4, 99, 104, 666, 99], [666], [1106, 0, 4, 99, 104, 666, 99]) // jump by value, print by value
test(5, [1106, 4, 4, 99, 104, 666, 99], [], 	[1106, 4, 4, 99, 104, 666, 99]) // does NOT jump if true
console.log('backwards compatible', run(5, dataDay5)[0] === 7079459)
//large numbers
test(5, [104,1125899906842624,99], [1125899906842624], [104,1125899906842624,99])

test(5, [1102,34915192,34915192,7,4,7,99,0], [1219070632396864], [1102,34915192,34915192,7,4,7,99,1219070632396864])

// relMode
test(5, [109, 1, 204, -1], [109], [109, 1, 204, -1])

// input relative base
test(7, [9, 1, 203, -1], [], [7, 1, 203, -1])

console.log(run(0, [1001,100,1,3]))

// copy of itself
test(5, [109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99], [109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99], [])

console.log(run(1, dataDay9))