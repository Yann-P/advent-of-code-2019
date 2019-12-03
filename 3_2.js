#!/usr/bin/env node

const fs = require('fs')
const _ = require('lodash')
const data = fs.readFileSync('./data/3_1.txt', { encoding: 'utf-8' })

const moves = data.split('\n').slice(0, 2).map(arr => arr.split(','))

function incl(x, start, end) {
	return x >= Math.min(start, end) && x <= Math.max(start, end);
}

function manhattan(p1, p2) {
	return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y)
}

function getDirection(letter) {
	return ({
		'U': pt(0, 1), 
		'D': pt(0, -1), 
		'R': pt(1, 0), 
		'L': pt(-1, 0)
	})[letter]
}

function next(p, move) {
	const res = /([UDRL])(\d+)/.exec(move)
	const letter = res[1]
	const scale = +res[2]
	return mksg(p.x, p.y, p.x + getDirection(letter).x * scale, p.y + getDirection(letter).y * scale)
}

// make point
const pt = (x, y) => ({x, y})
// make segment
const mksg = (x1, y1, x2, y2) => new Seg(pt(x1, y1), pt(x2, y2))
// make wire
const mkwire = (...sgs) => { const w = new Wire; for (const s of sgs) w.push(s); return w }

class Seg {
	constructor(start, end) {
		this.start = start 
		this.end = end
	}
	vertical() {
		return this.start.x == this.end.x;
	} 
		
	hitsSegment(s) {
		if (!(this.vertical() ^ s.vertical())) {
			return null;
		} 
		if(this.vertical() && !s.vertical() && incl(this.start.x, s.start.x, s.end.x) && incl(s.start.y, this.start.y, this.end.y)) {
			return pt(this.start.x, s.start.y)
		}
		if(!this.vertical() && s.vertical() && incl(this.start.y, s.start.y, s.end.y) && incl(s.start.x, this.start.x, this.end.x)) {
			return pt(s.start.x, this.start.y)
		}
	}

	equals(s) { return s.start.x == this.start.x && s.start.y == this.start.y && s.end.x == this.end.x && s.end.y == this.end.y }
};

class Wire {
	constructor() {
		this.segs = []
	}
	push(sg) {
		this.segs.push(sg);
	}

	lastPoint() {
		return this.segs.length ? this.segs[this.segs.length - 1].end : pt(1, 1)
	}

	wireLengthAt(index) {
		let len = 0;
		for (let i = 0; i <= index; i++) {
			len += manhattan(this.segs[i].start, this.segs[i].end)
		}
		return len;
	}
}

// TEST
console.log(next(pt(3, 1), 'U3'))
console.log(mksg(1, 1, 3, 1).vertical() === false)
console.log(mksg(1, 1, 3, 1).hitsSegment(mksg(2, 2, 2, 0)))
console.log(mksg(2, 2, 2, 0).hitsSegment(mksg(1, 1, 3, 1)))
console.log(mkwire(mksg(1, 1, 3, 1), mksg(3, 1, 2, 1)).wireLengthAt(1))
console.log('-')
// FIN TESTS

const candidates = []

const tw1 = mkwire();
const tm1 = moves[0] // ['R8','U5','L5','D3']
const tw2 = mkwire();
const tm2 = moves[1] //['U7','R6','D4','L4']

tm1.forEach((move, i) => tw1.push(next(tw1.lastPoint(), move)))
tm2.forEach((move, i) => {
	const sg = next(tw2.lastPoint(), move)
	tw2.push(sg)
	const hit = tw1.segs.find( s =>  s.hitsSegment(sg) ) 
	if (hit) {
		const pt = hit.hitsSegment(sg)
		const w1dist = tw1.wireLengthAt(tw1.segs.indexOf(hit)) - manhattan(hit.end, pt)
		const w2dist = tw2.wireLengthAt(tw2.segs.indexOf(sg)) - manhattan(sg.end, pt)
		candidates.push(w1dist + w2dist)
	}
});

console.log(Math.min(...candidates.filter(Boolean))) // virer les zéros