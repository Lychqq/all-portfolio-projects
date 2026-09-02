'use strict';

const arr = [7, 7, 5];

const checkArr = (arr) => {
    const random = Math.floor(Math.random() * 11);
    arr.push(random);

    const elementSum = arr.reduce((sum, elem) => sum + elem, 0);

    if (elementSum < 50) {
        return checkArr(arr);
    }

    return arr;
};

console.log(checkArr(arr));