'use strict';




// const n1 = setTimeout((str) => {
// console.log(str);
// }, 2000, 'yahoo');


// const n2 = setTimeout(() => {
// console.log('Ура');
// }, 1000);


// const n3 = setInterval((str) => {
// console.log(str);
// }, 1500, 'Привет')

// setTimeout(() => {
//     clearInterval(n3)
// }, 4000);





// let count = 0;

// let timerId = setTimeout(function tick() {
//     count++;
//     console.log('yahoo', count);
//     if (count < 5) {
//         setTimeout(tick, 4000)
//     } else if (count < 10) {
//         setTimeout(tick, 2000)
//     } else if (count < 15) {
//         setTimeout(tick, 1000)
//     } 
// }, 0)




// let count = 0;

// const tick = (tick) => {
//     console.log('tick: ', tick);
// }

// setTimeout(tick, 4000, 4);

// setTimeout(tick, 2000, 2);

// setTimeout(tick, 1000, 1);


// webApi = [
//     {
//         cb: tick,
//         delay: 4000,
//         time: Date.now(),
//     },
//     {
//         cb: tick,
//         delay: 3000,
//         time: Date.now(),
//     },
//     {
//         cb: tick,
//         delay: 2000,
//         time: Date.now(),
//     }
// ]

// const queue = ['tick2', 'tick3', 'tick4']

// const cs = ['tick2']





const timer = deadline => {
    const timerBlockHour = document.querySelector('.timer__block_hour')
    const timerBlockMin = document.querySelector('.timer__block_min')
    const timerBlockSec = document.querySelector('.timer__block_sec')



    const getTimeRemaining = () => {
        const dateStop = new Date(deadline).getTime();
        const dateNow = Date.now();
        const timeRemainig = dateStop - dateNow;


        const seconds = Math.floor(timeRemainig / 1000 % 60);
        const minutes = Math.floor(timeRemainig / 1000 / 60 % 60);
        const hours = Math.floor(timeRemainig / 1000 / 60 / 60);

        return{timeRemainig, seconds, minutes, hours}
    }




    const start = () => {
        const timer = getTimeRemaining()

        timerBlockHour.textContent = timer.hours
        timerBlockMin.textContent = timer.minutes
        timerBlockSec.textContent = timer.seconds

        const interbalId = setTimeout(start, 1000);

        if (timer.timeRemainig <= 0) {
            clearTimeout(interbalId)
            timerBlockHour.textContent = '00';
            timerBlockMin.textContent = '00'; 
            timerBlockSec.textContent = '00'; 
        }
    }

    start();
};


timer('2026/03/27 9:56')