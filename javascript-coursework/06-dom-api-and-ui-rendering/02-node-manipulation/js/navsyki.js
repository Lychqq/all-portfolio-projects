'use strict';


const items = document.querySelector(".items")
const props_list = document.querySelectorAll('.props__list') 
// console.log('items: ', items);
// console.log('items.children: ', items.children);
const ads = document.querySelector('.ads');
const props_item = document.querySelectorAll('.props__item');
const item_title = document.querySelectorAll('.item__title');


const cards = items.children;
const card1 = cards[0];
const card2 = cards[1];
const card3 = cards[2];
const card4 = cards[3];


const proplist5 = props_list[4];
const proplist3 = props_list[3];

items.insertBefore(card2, card1)
items.insertBefore(card3, card1)
items.insertBefore(card4, card1)


// console.log('props_list: ', props_list);

proplist5.after(proplist3);
item_title[2].after(proplist5);

// console.log(props_item);
props_item[3].after(props_item[14]);
props_item[19].after(props_item[44]);
props_item[19].after(props_item[43]);



// console.log(item_title);
item_title[1].after(item_title[3]);
props_list[3].prepend(item_title[4]);
props_list[5].prepend(item_title[1]);

ads.remove();