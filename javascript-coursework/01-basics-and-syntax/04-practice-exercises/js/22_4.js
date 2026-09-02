'use strict';

let moneyQuantity = Number(prompt('Сколько денег вам надо снять?'));

if (isFinite(moneyQuantity) && moneyQuantity>0){
    if (moneyQuantity % 100) {
     console.log('Извините но снять деньги не получится')
    } 
    else {
   console.log('Вам доступно снятие денег');
    }
} 
else {
    console.log('Вводи только положительные числа!!!');
}
