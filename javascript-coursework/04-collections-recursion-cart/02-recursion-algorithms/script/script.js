'use strict';

// const capitalize = str =>

// str[0].toUpperCase() + str.slice(1).toLowerCase();

// const getFullName = ({firstname, surname}) =>

// `${capitalize(firstname)} ${capitalize(surname)}`;

// const printFullName = arr => {

// arr.forEach(item => void console.log(getFullName(item)));

// }

// const listPerson = [
// {
// firstname: 'сергей',
// surname: 'попов',
// },
// {
// firstname: 'Александр',
// surname: 'иванов',
// },
// {
// firstname: 'Олег',
// surname: 'Петров'
// }];

// printFullName(listPerson);

// const bar = (x) => {
//     x*=2;
//     if (x>100) {
//         return x
//     }
//     return foo(x);
// };



// const foo = (x) => {
//     x*=3;
//     if (x<100) {
//        return foo(x);
//     };
//     return bar(x)
// };
// console.log(foo(2));



const pow = (n, power) => {
    if (power === 1) {
        return n;
    } else {
        return pow(n, power - 1) * n;
    }
};

console.log(pow (5,5));


const factorial = n => {
    if (n===0) {
        return 1;
    } else {
        return factorial(n-1) * n
    }
};
console.log(factorial(8));


const fibo = n => {
    if (n <= 2) {
        return 1;
    } else {
        return fibo(n - 1) + fibo(n - 2);
    }
};

console.time('fibo');
console.log(fibo(30));
console.timeEnd('fibo');


const fibo2 = n => {
     let a = 1;
     let b = 0;
     let c = 0;

     while (n > 0) {
        c = a + b;
        b = a;
        a = c;
        n -= 1;
     }
     return b
};

console.time('fibo2');
console.log(fibo2(100));
console.timeEnd('fibo2');