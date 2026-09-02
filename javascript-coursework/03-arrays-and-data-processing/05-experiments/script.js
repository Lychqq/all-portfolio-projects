'use strict'


const ingridients = [20, 30, 120]
const recipe = (ingridients, diametr_1, diametr_2) => {
    const factor = Math.pow(diametr_1/diametr_2, 2);
    let new_ingridients = [];

    ingridients.forEach(element => {
        new_ingridients.push(+(element*factor));
    });

    return new_ingridients
}

console.log(ingridients, 16, 22);