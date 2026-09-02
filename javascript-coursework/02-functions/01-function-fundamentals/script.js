'use strict';

const getMilk = (cash) => {
    return 'молоко';     
};

const getBread = (cash) => {
    return 'хлеб';     
};

const goToShop  = (money) => {
    console.log('Пришли в молочный магазин');

    const milk = getMilk(money);

    console.log('пришли в хлебный киоск');

    const bread = getBread(money);

    return `${milk} ${bread}`;
}

const result = goToShop(100);
console.log('result', result);


const foo = () => { // нельзя вывазвть до инициалиации
    console.log('foo')
};

const bar = function() { // нельзя вывазвть до инициалиации
    console.log('bar')
};

function bad() {
    console.log('bad') // наплевать где вызвать
};



// самовызыващаяся функция
{
    
};