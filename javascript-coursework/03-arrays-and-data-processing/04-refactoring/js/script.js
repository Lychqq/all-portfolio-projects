'use strict';

const converter = (amount, currency, promo) => {
    currency = currency.toLowerCase();
    let rub;
    let date = new Date();
    let dayOfTheWeek = date.getDay();
    let promocode = promo; 

    if (isNaN(amount) || amount <= 0) {
        return "Ошибка: сумма должна быть положительным числом";
    }

    switch (currency) {
        case "eur":
            rub = amount * 94.42;
            break;
        case "usd":
            rub = amount * 81.13;
            break;
        case "tenge":
            rub = amount * 0.1554;
            break;
        default:
            return "Ошибка: неизвестная валюта. Допустимые значения: eur, usd, tenge";
    }

    switch (promocode) {
        case "NY2 grinding":
            rub = rub - (rub * 0.26);
            break;
        case "WINTER":
            rub = rub - (rub * 0.1);
            break;
        case "FR2026":
            if (dayOfTheWeek === 5) { 
                rub = rub - (rub * 0.05);
            } else {
                return "Промокод FR2026 доступен только в пятницу";
            }
            break;
    }

    return rub;
};

let amount = parseFloat(prompt('Введите сумму для конвертации:'));
let currency = prompt('Введите валюту (eur, usd, tenge):');
let promo = prompt('Введите промокод (если есть):');

let result = converter(amount, currency, promo);
alert("В рублях: " + result);
