'use strict'


const dom = document.querySelector('#dom');                         
//_______________________________________________________________________
// const forntad = document.querySelector('.props__list_frontend');     |
//                                                                      |
// console.log(dom.nextElementSibling);                                 | УСТРЕВШИЕ КОМАНДЫ  
// console.log(dom.nextSibling);                                        |
//                                                                      |
// console.log(forntad.previousSibling);                                |
// console.log(forntad.previousElementSibling);                         |
// console.log(dom.firstChild);                                         |
// console.log(dom.firstElementChild);                                  |
// _______________________________________________________________________



console.log(dom.parentElement);
console.log(dom.parentNode);
console.log(dom.closest('.item-front'));


// работа с классами

dom.classList;
dom.classList.add('red', 'green');
console.log(dom.matches('что то'));

console.log(dom.classList.contains('chtoto')); // проверяет ли есть класс н элементе



// атрибуты элементов


const logu =[];

console.log(logu.src);
console.log(logu.alt);
logu.hasAttribute('href');
logu.getAttribute('href');
logu.setAttribute('href');
logu.removetAttribute('href');


// дата атрибуты и вствка

const ajax= [];

console.log(ajax.dataset.text);

const text = document.createTextNode(ajax);
ajax.textContent

const ajaxText = ajax.dataset.text // ДЛЯ ДАТА АТРИУАТ ТИПА data-text = ''

console.log(dom.innerHTML);
console.log(dom.outerHTML);

dom.insertAdjacentHTML('beforeend', 'chto to');
dom.insertAdjacentHTML(\"afterbegin", 'tyty')


const styled = getComputedStyle(front);
console.log('styled', styled)