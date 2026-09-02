'use strict';

let russianLanguageExam = Number(prompt('Введите  кол-во баллов по: русскому языку'));
let  informaticsExam = Number(prompt('Введите кол-во баллов по: иформатики' ));
let  mathExam = Number(prompt('Введите  кол-во баллов по: математике'));
let res;

if (isFinite(russianLanguageExam) && russianLanguageExam > 0 &&  isFinite(informaticsExam) && informaticsExam > 0 && isFinite(mathExam) && mathExam > 0) {
     res = russianLanguageExam + informaticsExam + mathExam;
console.log(res);

if (res >= 265) {
    console.log('Поздравляю, вы поступили на бюджет');
} else{
    console.log('К сожалению, вы не поступили на бюджет')
}
} 
else {
    console.log('Ввводи только положительные числа')
}
