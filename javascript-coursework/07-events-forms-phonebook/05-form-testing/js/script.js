'use strict';
const regForm = document.registration
console.log(regForm);
console.log(regForm.elements);
regForm.elements[0].value = "rrtre"
regForm.elements[5]
console.log('regForm.elements[5]: ', regForm.elements[4]);
console.log(regForm.elements[0]);
// console.log(regForm.length);
// console.log(regForm.name);
// console.log(regForm.action);
// console.log(regForm.method);


const fio  = regForm.elements[0];
const calend = regForm.elements[1]

fio.addEventListener ("input", () =>{
    console.log(fio.value);
} );


calend = regForm




// элементы option имеют своства: option.selected - выбрана ли опция
// option.index - номер среди других в списке
// optuon.value - Значение опции.
// option.text - содержимое опции(то что видит посититель)
// при отправки формы поисхдит осбытие smbit 