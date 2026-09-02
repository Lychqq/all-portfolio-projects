'use strict';

let line = prompt("Введите строку");

const reverseString = (s) => {
    
  return String(s).split('').reverse().join('');
}


console.log(reverseString(line)); 
