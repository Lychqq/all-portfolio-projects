'use strict'

// const x = 5;
// const scope = (y, z) => {
//     //lexicalEnvironment = {y:25, z: undefined}
//     const x = 15;
//      //lexicalEnvironment = {x:15 y:25, z: undefined}
//     console.log(x, y, z);
//     const scope2 = () => {
//           //lexicalEnvironment = {}
//         console.log(x);
//     };
//     scope2();

// };
// scope(25);




let x = 5;
const scope0ne = (y) => {
    //scope = globalScope = {x: 5};
    console.log(x + y);
};
x = 15;
scope0ne(25);
const scopetwo = () => {
        let x = 0;
    scope0ne(25);
    scope0ne(25); scope0ne(25);
}

scopetwo()