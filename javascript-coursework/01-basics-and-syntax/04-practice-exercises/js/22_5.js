'use strict';

let salary = Number(prompt('Введите свою заработную плату'));
let tax;
if (salary > 0 && isFinite(salary)) {
    switch (true) {
  case salary <= 15000:
    tax = salary * 0.13;
    console.log(tax);
    break;
  case salary > 15000 && salary <= 50000:
    tax = salary * 0.2;
    console.log(tax);
    break;
  case salary > 50000:
    tax = salary * 0.3;
    console.log(tax);
    break;
default:
    console.log('Вводи цифры');

}

} 
else {
    console.log('Вводи толькооо числа больше 0!!!');
}
