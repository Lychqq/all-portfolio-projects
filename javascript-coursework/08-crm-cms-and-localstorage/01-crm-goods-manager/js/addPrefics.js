'use strict';



const names = ['Noah', 'Liam', 'Mason', 'Jacob', 'Robot', 'william', 'Ethan', 'Michael', 'Alexander'];


const addPrefix = (names, prefics) => {
     let massiv_with_prefics = names.map(el => { return prefics + el; });
     console.log(massiv_with_prefics);
}

addPrefix(names, 'Mr');