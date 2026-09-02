'use strict';


const cards = document.querySelectorAll(".item")
const props_list = document.querySelectorAll('.props__list') 
const ads = document.querySelector('.ads');
const props_item = document.querySelectorAll('.props__item');

const item_title = document.querySelectorAll('.item__title');


cards[1].after(cards[0]);
cards[0].before(cards[2]);
cards[0].before(cards[3])

props_list[4].after(props_list[3]);
item_title[2].after(props_list[4]);

props_item[3].after(props_item[14]);
props_item[19].after(props_item[44]);
props_item[19].after(props_item[43]);

item_title[1].after(item_title[3]);
props_list[3].prepend(item_title[4]);
props_list[5].prepend(item_title[1]);

ads.remove();