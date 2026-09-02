'use strict';

function reverseString(s) {
    
  return String(s).split('').reverse().join('');
}


console.log(reverseString('Привет мир')); 
console.log(reverseString('Hello')); 