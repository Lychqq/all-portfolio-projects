'use strict'

// const $ = (() => {
//     const privatVar = 'Приватные данные';
//     const openVar = 'ОТкрыте данные'
//     const app = () => {
//          console.log('Моё новое кутое приложение');
//      };
//      const getData = () => privatVar;

//      return {
//         app,
//         openVar,
//         getData
//      };
        
// })();

// console.log($);

// $.app();
// console.log($.openVar);
// console.log($);



const moduleOne = require('./modules/moduleOne');
const {postfix, names}= require('./modules/moduleTwo');

names.forEach(name => {
    console.log(moduleOne(name,postfix));
})