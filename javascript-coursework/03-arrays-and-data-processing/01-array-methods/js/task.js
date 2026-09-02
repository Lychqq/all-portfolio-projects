'use strict';


let check = [
    ['чипсы', 120, 3],
    ['йогурт', 150, NaN],
    ['пакеты', -456, 1],
    ['сникерс', 78, 1],
    ['сникерс', NaN, 1],
    ['сникерс', 78, -1],
    ['туалетная бумага', 500, 3],
];

// for (let i = 0; i < 4; i++) {
//     let productName = prompt('Введите название товара');
//     let productPrice = parseFloat(prompt('Введите стоимость товара'));
//     let productQuantity=  parseInt(prompt('Введите количство товара в чеке'));

//     let proverkaPovtora = check.findIndex(item => item[0] === productName); 

//     if (proverkaPovtora!==-1) {
//         check[proverkaPovtora][2] += productQuantity;
//     }
//     else{
//         check.push([productName, productPrice, productQuantity]);
//     }
// }



let total = 0; // итоговая сумма покупки
let table = []; // массив для таблицы

if (check.length) {

    for (let i = 0; i < check.length; i++) {
    let [productName, productPrice, productQuantity] = check[i]; // перебор массива

    if (
        typeof productPrice === 'number' && typeof productQuantity === 'number'
        && !isNaN(productPrice) && !isNaN(productQuantity) && productName != null // проверка
        && productPrice > 0 && productQuantity > 0
    ) {
        let sum = productPrice * productQuantity;   // если данные корректны считается сумма товара и добвляется в итоговую сумму чека, данные заносятся в таблицу
        total += sum;
        table.push({
            Товар: productName,
            Количество: productQuantity,
            Цена: productPrice,
            Сумма: sum
        });
    }
    else
    {
        console.log(`${productName} - удален из чека (некорректные данные)`); // если данные не корректы удаляем и уменьшаем индекс чтобы не пропустить следующий подмассив
        check.splice(i, 1);
        i--;
    }
}
}
else{
    console.log('Чек пустой');
}

if (check.length) { // проверка не пустой ли  массив после поверки на корректность данных
console.table(table); 
console.log(total);
}
else{
    console.log('Чек пустой');
}
