'use strict';

// задача 1
let costofliving = 20644;
const salary = [];

for (let i = 0; i < 100; i++) {
    salary.push(Math.floor(Math.random()*(100000-1000+1))+1000);
}
console.log(salary);

const lowSalaryCount = salary.filter(s => s<costofliving).length;
console.log('кол-во сотрудников получающие зп меньше прожиточного минимума:',lowSalaryCount);


const maxSalary = Math.max(...salary); 
console.log('Максимальная зарплата:', maxSalary);
const maxSalaryIndex = salary.indexOf(maxSalary) + 1;

console.log('номер сотрудника:', maxSalaryIndex);


const averageSalary = salary.reduce((sum, s) => sum + s, 0) / salary.lenght;
console.log('средняя зарплата:', averageSalary);

const top5Salary = [...salary].sort((a,b) => b - a).slice(0,5)

console.log('топ 5 зарплат:',top5Salary);






// задача 2


let prices = [120.50, 99,99, 10.03, 789,78];

const interprises = (prices, percent) => {
    return prices.map(price => +(price*(1+percent/100)).toFixed(2));
}

console.log(interprises(prices,15))





// задача 3 


const arr = ["банан", 7, "бомба", "вишни", "лимон"];

const randomArray = [];

for (let i = 0; i < 3; i++) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  randomArray.push(arr[randomIndex]);
}

console.log("Случайные элементы:", randomArray);

if (
  randomArray.length === 3 &&
  randomArray.every(el => el === 7)
) {
  console.log("Бинго");
} else {
  console.log("Лошара, давай еще денях");
}



// задача 4 


const uniqueInOrder = (iterable) => {
  return [...iterable].filter((item, index) => item !== iterable[index - 1]);
} 


console.log(uniqueInOrder([1,1,2,2,3,5, 'в', 'в', 3,2]));


console.log(uniqueInOrder("AAAABBBCCDAABBB"));




// задача 5 не доделаанная



'use strict';


const isStrongPassword = (password) => {
    for (let i = 0; i < password.length; i++) {
    const char = password[i];
    if(password.length < 8 || (char >= 'A' && char <= 'Z') || (char >= '0' && char <= '9') || char >= 'А' && char <= 'Я'  ){
        return 'не надежный пароль';
    }
    else {
        return 'надежный пароль'
    }
}
}


console.log(isStrongPassword('привет646456'));