'use strict';
const MYWEIGHT = Number(prompt("Введите вес тела"));
const SPEEDLIGHT = 3e8;

let e = MYWEIGHT*Math.pow(SPEEDLIGHT, 2);

console.log(e)