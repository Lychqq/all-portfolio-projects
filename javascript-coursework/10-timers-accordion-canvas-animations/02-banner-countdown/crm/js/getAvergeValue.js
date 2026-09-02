'use strict';

const allCashbox = [4500, 3210, 650, 1250, 7830, 990, 13900, 370];



const getAvergeValue = (allCashbox) => {
    let sum_elemnts = allCashbox.reduce(function(sum, elem){return sum + elem;},0);
    let arithmetic_mean = sum_elemnts/allCashbox.length;
    console.log(Math.floor(arithmetic_mean));
}

getAvergeValue(allCashbox);