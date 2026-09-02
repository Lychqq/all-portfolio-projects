'use strict';

// let myArr = [3, 5, 'blabla', false];

// let nemoyArr = [2, 2, 45];

// let mes=myArr.concat(nemoyArr);

// console.log(mes);


// const myArr = [];

// myArr.push(prompt('Введите элемент массива'));
// myArr.push(prompt('Введите элемент массива'));
// myArr.push(prompt('Введите элемент массива'));
// myArr.push(prompt('Введите элемент массива'));

// console.log(myArr);


// const myArr = ['retert', 6, 7, 56, 'test', 'isp'];

// let r = myArr.splice(-3, 3, 'ree', 'wew', 'iop');
// console.log(myArr);

// console.log(myArr.includes(6));


// const numberArr = ['Борис', "Коля", "Апполон"];

// console.log(numberArr.sort());


const price = [1200, 2000, 6000];

console.log(price.every(elem => typeof(elem) == 'number' && elem>0));

if(price.some(elem => elem<0)) {
    console.log('Введены неверные даные');
}
else{
    price.forEach((elem, i, ar) => {
        ar[i] = elem*1.2;
        console.log(price);
    
    })
}

