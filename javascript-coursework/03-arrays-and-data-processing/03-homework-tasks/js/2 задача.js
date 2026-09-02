'use strict';

function isPrime(n) {

  if (!Number.isInteger(n) || n <= 1) return false;

  for (let i = 2; i < n; i++) {
    if (n % i === 0) {
      return false; 
    }
  }

  return true;
}

console.log(isPrime(5));
console.log(isPrime(11));
console.log(isPrime(9));
console.log(isPrime(1));