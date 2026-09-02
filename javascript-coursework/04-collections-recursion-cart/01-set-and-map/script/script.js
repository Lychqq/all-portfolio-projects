'use strict';

// const car = {
//     car: 'mini',
//     model: 'cooper',
//     price: 30000,
//      get comment(){
//         return this.trueComment;
//     },
//     set comment(val) {
//         if (typeof val === 'string') {
//             this.trueComment = val;
//         }
//     },
//     trueComment: 'not',
// };



// console.log(car.comment);
// car.comment = 123;
// console.log(car.comment);
// car.comment = 'Супер тачка';
// console.log(car.comment);
// console.log(car);
// console.log(Object.keys(car));
// console.log(Object.values(car));
// console.log(Object.entries(car));



// const str = new String('Привет');
// console.log('str', str);

// const number = new Number(5);
// console.log('number:', number);

// const bool = new Boolean(true);
// console.log('bool', bool);




// const actors = new Map();
const actors = new WeakMap();

const heroes = new Set();

heroes.add('Hulk');
heroes.add('Spiderman');
heroes.add('StarLor');
const arr = [1,2,3,4,5,6,3,5,5,17,8];
console.log(Array.from(new Set(arr)));


const Batman = {
    title: 'Batman',
    universe: 'dc'
}


const Hulk = {
    title: 'Hulk',
    universe: 'Marvel'
}
const DoctorStrange = {
    title: 'Docto Strange',
    universe: 'Marvel'
}

const Spiderman = {
    title: 'Spiderman',
    universe: 'Marvel'
}


const Ironman = {
    title: 'Iron man',
    universe: 'Marvel'
}

const Wolverine = {
    title: 'Wolverine',
    universe: 'Marvel'
}

const SuperMan = {
    title: 'Superman',
    universe: 'Marvel'
}
const StarLord = {
    title: 'Star-Lord',
    universe: 'Marvel'
}

const Tor = {
    title: 'Tor',
    universe: 'Marvel'
}


actors.set(Batman, 'Бен Аффлек');
actors.set(Hulk, 'Бенедикт Камбебэтч');
actors.set(DoctorStrange, 'Тоби Магуайр');
actors.set(Spiderman, 'Роберт Дауни-мл');
actors.set(Ironman, 'Хью Джекман');
actors.set(Wolverine, 'Генри Кавилл');
actors.set(SuperMan, 'Марк Руффало');
actors.set(StarLord, 'Крис Прэтт');
actors.set(Tor, 'Крис Хемсворт');


actors.delete('Tor');
// actors.clear()
console.log(actors.get('Hulk'));
// console.log(actors.keys());
// console.log(actors.values());

for (const hero of actors) {
    console.log(hero);
}

for (const [hero, actor] of actors) {
    console.log(`${actor} role ${hero}`);
}


console.log('actors : ', actors );
// console.log('actors : ', actors.size );
