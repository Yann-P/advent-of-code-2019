#!/usr/bin/env node

const fs = require('fs')
const data = fs.readFileSync('./data/1_1.txt', { encoding: 'utf-8' })

const range = [147981,691423]

function getDigit(number, n) {
    return Math.floor((number / Math.pow(10, n)) % 10);
}

function ascendingDigits(number) {
    let digit = getDigit(number, 0)
    for(let i = 1; i < 6; i++) {
        if(digit < (digit = getDigit(number, i))) 
            return false
    }
    return true;
}

function atLeastTwoRepeating(number) {
    const used = new Set;
    for(let i = 0; i < 6; i++) {
        const digit = getDigit(number, i);
        if(used.has(digit)) {
            return true;
        }
        used.add(digit, true)
    }
    return false;
}

let possibilities = 0;
for (let c = range[0]; c <= range[1]; c++) {
    if(ascendingDigits(c) && atLeastTwoRepeating(c)) {
        possibilities++;
    }
}

console.log(possibilities)