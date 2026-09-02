'use strict';

let prouctName = prompt('Введите  название товара');
let productCategory = prompt('Введите  категорию товара');
let productQuantity = Number(prompt('Введите  количество товара'));
let productPrice = Number(prompt('Введите  цена товара' ));


if (!isNan(productQuantity) && !isNaN(productPrice) && productQuantity>0 && productPrice>0) {
     console.log(`На складе осталось ${PRODUCTQUANTITY} товара ${PRODUCTNAME} на сумму ${PRODUCTPRICE*PRODUCTQUANTITY}`);
  } else {
    console.log('ВЫ ввели некорректные данные')
  }
