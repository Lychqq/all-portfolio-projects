'use strict';
let prouctName = 'Air Pods Pro Max';
let productQuantity = 12;
let productCategory = 'Наушники';
let productPrice = 30000;


console.log(prouctName);
console.log(productQuantity*productPrice);

const  PRODUCTNAME = prompt('Введите  название товара');
const PRODUCTQUANTITY = Number(prompt('Введите  количество товара'));
const  PRODUCTCATEGORY = prompt('Введите  категорию товара');
const  PRODUCTPRICE = Number(prompt('Введите  цена товара' ));

console.log(typeof PRODUCTNAME);
console.log(typeof PRODUCTQUANTITY);
console.log(typeof PRODUCTCATEGORY);
console.log(typeof PRODUCTPRICE);


console.log(`На складе осталось ${PRODUCTQUANTITY} товара ${PRODUCTNAME} на сумму ${PRODUCTPRICE*PRODUCTQUANTITY}`);