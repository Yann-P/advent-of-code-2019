#!/usr/bin/env node

const fs = require('fs')
const data = fs.readFileSync('./data/1_1.txt', { encoding: 'utf-8' })

const values = data.split('\n')
const res = values
	.filter(x=>!!x.length)
	.map(v=>+v)
	.map(v=>Math.floor(v/3)-2)
	.reduce((acc, x) => acc + x, 0)

console.log(res)
