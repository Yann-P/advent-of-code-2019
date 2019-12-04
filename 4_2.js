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

function atLeastTwoRepeatingNotPartOfBiggerGroup(number) {
    let candidates = new Set;
    
    for(let d = 0; d <= 9; d++) {
        for(let i = 0; i < 5; i++) {
            if(getDigit(number, i) === d && getDigit(number, i + 1)  === d) {
                candidates.add(d);
            }
        }
    }

    for(const d of [...candidates]) {
        for(let i = 1; i < 5; i++) {
            if(getDigit(number, i - 1) === d && getDigit(number, i)  === d && getDigit(number, i + 1) === d) {
                candidates.delete(d);
                break;
            }
        }
    }
    return candidates.size !== 0;
}

let possibilities = 0;
for (let c = range[0]; c <= range[1]; c++) {
    if(ascendingDigits(c) && atLeastTwoRepeatingNotPartOfBiggerGroup(c)) {
        possibilities++;
    }
}

console.log(possibilities)