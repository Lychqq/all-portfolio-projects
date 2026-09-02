'use strict';

{
    const app = document.querySelector('#app');

    const reservation = document.createElement('div');
    reservation.classList.add('reservation');

    let countArea = 0;


    const creatSeat = i => {
        const seat = document.createElement('div');
        seat.classList.add('seat');
        seat.dataset.seatNumber = i;
        return seat;
    }

    const createLine = (countLine, y) => {
        const line = document.createElement('div');
        line.classList.add('line');
        line.dataset.lineNumber = countLine;

        for (let i = 1; i<=y; i++) {
            line.append(creatSeat(i))
        }
        return line;
    };

    const createArea = (x,y) => {
        countArea+=1;
        const area = document.createElement('div');
        area.classList.add('area');
        area.dataset.areaNumber = countArea;
        
        for (let i = 1; i<=x; i++) {
            area.append(createLine(i,y))
        }
        return area;
   };

   const createReservationParagraph = (text,reservation,area,line,seat) => {
        const reservationParagraph = document.createElement('p')
        reservationParagraph.classList.add('reservationParagraph')
        reservationParagraph.classList.add(`seat${area}line${line}seat${seat}`)
        reservationParagraph.textContent = text 
        reservation.append(reservationParagraph)


   };

   const createButton = () => {
    const button = document.createElement('button')
    button.classList.add('btn');
    button.textContent = 'забронировать'
    return button
   }



   app.append(createArea(5,6));
   app.append(createArea(8,6));
   app.append(createArea(6,6));
    document.body.append(reservation);
    document.body.append(createButton());

    app.addEventListener('click', e => { 
        const target = e.target; // позволяет понять на какой элмент именнно кликнули
        if(target.classList.contains('seat')){
            const seat = target.dataset.seatNumber;
            const line = target.closest('.line').dataset.lineNumber;
            const area = target.closest('.area').dataset.areaNumber;

            if(target.style.backgroundColor === 'brown')
            {
                target.style.backgroundColor = 'tomato';
                createReservationParagraph(`Ваш зал №${area} / ряд №${line} / место №${seat}`,reservation,area,line,seat);
            }
            else
            {
                target.style.backgroundColor = 'brown';
                const elementToRemove = reservation.querySelector(`.seat${area}line${line}seat${seat}`);
                if (elementToRemove) {
                    reservation.removeChild(elementToRemove);
                }
                
            }
        }
    });


   // делегирование это обработка событий на родительском элементе с провереой на дочернем элемте какое событие произошло
}
