console.log(x);
function thisFoo (a, b, c) {
    console.log(a, b, c);
    console.log(this);
};

const obj = {
    x: 5,
    y: 15,
    bar() {
    console.log( this);
    }
};

// thisFoo.call(obj, 1, 2, 3);
// thisFoo.apply(obj, [1, 2, 3]);
const bar = thisFoo.bind(obj, 1, 2);