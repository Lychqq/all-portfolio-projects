'use strict';


const block = document.createElement('div');
let countArea = 0;


const creatSlot = i => {
        const seat = document.createElement('div');
        seat.classList.add('slot');
        seat.dataset.seatNumber = i;
        return seat;
    }

    const createLine = (countLine, y) => {
        const line = document.createElement('div');
        line.classList.add('line');
        line.dataset.lineNumber = countLine;

        for (let i = 1; i<=y; i++) {
            line.append(creatSlot(i))
        }
        return line;
    };

    const createLotteryTicket = (x,y) => {
        countArea+=1;
        const area = document.createElement('div');
        area.classList.add('ticket');
        area.dataset.areaNumber = countArea;
        
        for (let i = 1; i<=x; i++) {
            area.append(createLine(i,y))
        }
        return area;
   };



   document.body.append(block);
   block.append(createLotteryTicket(25,25));

const par = Math.random() <0.1 & 1 : 0


   const cells = document.querySelectorAll('.slot');
   const percentage = 30;

