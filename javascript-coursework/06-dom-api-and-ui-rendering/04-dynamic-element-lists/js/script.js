'use strict';

const ul = document.createElement('ul');
ul.id = 'list'

const list = document.getElementById('list');
console.log('list: ', list);

const addItem = (text) => {
    const li = document.createElement('li');
    li.textContent = text;
    list.append(li);
};

const deleteLast = () => {
    if(list.lastElementChild) {
        list.lastElementChild.remove();
    }
};

const clearAll = () => {
    list.innerHTML = '';
};

const start = () => {
    while(true) {
        let input = prompt('Введите текст:');
        
        if(input === null || input === 'exit') {
            break;
        }
        
        if(input === 'del') {
            deleteLast();
            continue;  
        }
        
        if(input === 'clear') {
            clearAll();
            continue;  
        }
        
        if(input && input.trim() !== '') {
            addItem(input);
        }
        
    }
};

start();