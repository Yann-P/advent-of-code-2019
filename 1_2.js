#!/usr/bin/env node

const fs = require('fs')
const data = fs.readFileSync('./data/1_1.txt', { encoding: 'utf-8' })

function fuelForMass(mass) {
	return Math.max(0, Math.floor(mass / 3) - 2);
}

function fuelRequired(mass) {
	let remMass = mass;
	let fuel = 0;
	while(remMass > 0) {
		let additionalFuel = fuelForMass(remMass)
		remMass = additionalFuel
		fuel += additionalFuel
	}
	return fuel;
}

const values = data.split('\n')
const res = values
	.filter(x=>!!x.length)
	.map(v=>+v)
	.map(v=>fuelRequired(v))
	.reduce((acc, x) => acc + x, 0)

console.log(res)
