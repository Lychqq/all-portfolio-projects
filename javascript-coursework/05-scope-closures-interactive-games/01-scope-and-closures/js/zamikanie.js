'use strict';
// const bar = (x) => {
//     const y = 'II замыкание';
//     return (z) => {
//         console.log(x, y, z);
//     }
// };
// const foo = bar('I замыкание');
// foo('III не замкнут');
// console.dir(foo);


'use strict';
const bar = (x) => (y) => (x) => x + y + z;

const foo1 = bar(5);
console.log(foo1);
const foo2 = foo1(15);
console.log('foo2 : ', foo2 );
