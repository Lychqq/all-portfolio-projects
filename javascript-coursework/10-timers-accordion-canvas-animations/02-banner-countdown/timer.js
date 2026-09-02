const initTimers = () => {
    const timers = document.querySelectorAll('[data-timer-deadline]');
    timers.forEach(timerEl => timer(timerEl));
};


const timer = (bannerEl) => {
    const deadline = bannerEl.dataset.timerDeadline;

    // строим весь баннер
    bannerEl.innerHTML = `
        <img class="banner__image" src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80" alt="Ноутбук">
        <div class="banner__overlay"></div>
        <div class="banner__content">
            <div class="banner__title">-<span>50%</span> на все<br>ноутбуки</div>
            <div class="timer">
                <div class="timer__label">До конца акции</div>
                <div class="timer__blocks">
                    <div class="timer__block" data-block="days">
                        <div class="timer__value">00</div>
                        <div class="timer__unit">дней</div>
                    </div>
                    <div class="timer__sep" data-sep="days">:</div>
                    <div class="timer__block" data-block="hours">
                        <div class="timer__value">00</div>
                        <div class="timer__unit">часов</div>
                    </div>
                    <div class="timer__sep" data-sep="hours">:</div>
                    <div class="timer__block" data-block="minutes">
                        <div class="timer__value">00</div>
                        <div class="timer__unit">минут</div>
                    </div>
                    <div class="timer__sep" data-sep="minutes">:</div>
                    <div class="timer__block" data-block="seconds">
                        <div class="timer__value">00</div>
                        <div class="timer__unit">секунд</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const blockDays    = bannerEl.querySelector('[data-block="days"]');
    const blockHours   = bannerEl.querySelector('[data-block="hours"]');
    const blockMinutes = bannerEl.querySelector('[data-block="minutes"]');
    const blockSeconds = bannerEl.querySelector('[data-block="seconds"]');
    const timerEl      = bannerEl.querySelector('.timer');

    const sepDays    = bannerEl.querySelector('[data-sep="days"]');
    const sepHours   = bannerEl.querySelector('[data-sep="hours"]');
    const sepMinutes = bannerEl.querySelector('[data-sep="minutes"]');


    const getTimeRemaining = () => {
        const browserOffset = new Date().getTimezoneOffset() * 60 * 1000;
        const utc3Offset = 3 * 60 * 60 * 1000;
        const dateStop = new Date(deadline).getTime() + browserOffset - utc3Offset;
        const timeRemaining = dateStop - Date.now();

        const seconds = Math.floor(timeRemaining / 1000 % 60);
        const minutes = Math.floor(timeRemaining / 1000 / 60 % 60);
        const hours   = Math.floor(timeRemaining / 1000 / 60 / 60 % 24);
        const days    = Math.floor(timeRemaining / 1000 / 60 / 60 / 24);

        return {timeRemaining, seconds, minutes, hours, days};
    };


    const getDayWord = (n) => {
        const mod10 = n % 10;
        const mod100 = n % 100;
        if (mod100 >= 11 && mod100 <= 19) return 'дней';
        if (mod10 === 1) return 'день';
        if (mod10 >= 2 && mod10 <= 4) return 'дня';
        return 'дней';
    };

    const getHourWord = (n) => {
        const mod10 = n % 10;
        const mod100 = n % 100;
        if (mod100 >= 11 && mod100 <= 19) return 'часов';
        if (mod10 === 1) return 'час';
        if (mod10 >= 2 && mod10 <= 4) return 'часа';
        return 'часов';
    };

    const getMinuteWord = (n) => {
        const mod10 = n % 10;
        const mod100 = n % 100;
        if (mod100 >= 11 && mod100 <= 19) return 'минут';
        if (mod10 === 1) return 'минута';
        if (mod10 >= 2 && mod10 <= 4) return 'минуты';
        return 'минут';
    };

    const getSecondWord = (n) => {
        const mod10 = n % 10;
        const mod100 = n % 100;
        if (mod100 >= 11 && mod100 <= 19) return 'секунд';
        if (mod10 === 1) return 'секунда';
        if (mod10 >= 2 && mod10 <= 4) return 'секунды';
        return 'секунд';
    };

    const pad = n => n < 10 ? '0' + n : '' + n;


    const start = () => {
        const t = getTimeRemaining();

        if (t.timeRemaining <= 0) {
            timerEl.style.display = 'none';
            return;
        }

        blockDays.querySelector('.timer__value').textContent    = pad(t.days);
        blockHours.querySelector('.timer__value').textContent   = pad(t.hours);
        blockMinutes.querySelector('.timer__value').textContent = pad(t.minutes);
        blockSeconds.querySelector('.timer__value').textContent = pad(t.seconds);

        blockDays.querySelector('.timer__unit').textContent    = getDayWord(t.days);
        blockHours.querySelector('.timer__unit').textContent   = getHourWord(t.hours);
        blockMinutes.querySelector('.timer__unit').textContent = getMinuteWord(t.minutes);
        blockSeconds.querySelector('.timer__unit').textContent = getSecondWord(t.seconds);

        // секунды скрыты пока есть дни
        if (t.days > 0) {
            blockSeconds.style.display = 'none';
            sepMinutes.style.display = 'none';
        } else {
            blockSeconds.style.display = '';
            sepMinutes.style.display = '';
        }

        // скрываем ведущие нулевые блоки
        if (t.days === 0) {
            blockDays.style.display = 'none';
            sepDays.style.display = 'none';
        } else {
            blockDays.style.display = '';
            sepDays.style.display = '';
        }

        if (t.days === 0 && t.hours === 0) {
            blockHours.style.display = 'none';
            sepHours.style.display = 'none';
        } else {
            blockHours.style.display = '';
            sepHours.style.display = '';
        }

        if (t.days === 0 && t.hours === 0 && t.minutes === 0) {
            blockMinutes.style.display = 'none';
            sepMinutes.style.display = 'none';
        } else {
            blockMinutes.style.display = '';
        }

        // срочный режим если меньше 24 часов
        if (t.days === 0) {
            timerEl.classList.add('timer--urgent');
        } else {
            timerEl.classList.remove('timer--urgent');
        }

        setTimeout(start, 1000);
    };

    start();
};


document.addEventListener('DOMContentLoaded', initTimers);
