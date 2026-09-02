'use strict'

const foo = () => {
    alert('БУУМ');
};


const btnOne = document.querySelector('btn-one');
const btnTwo = document.querySelector('btn-two');
const link = document.querySelector('.link');
const divv = document.querySelector('.pr')
const text = document.createElement('h1');

// btnOne.onclick = () => {
//     alert('тыдыщ');
// };



// btnOne.addEventListener('click',() => {
//     alert('тыдыщ');
// });

// btnOne.addEventListener('click',foo);
// btnOne.removeEventListener('click',foo);
divv.addEventListener('mouseenter',() =>{
    divv.append(text);
    text.append('Николай')
});

// link.addEventListener('click', event => {
//    event.preventDefault(); // изменяет действи элемента по умолчанию
//     console.log(link.textContent);
// });
