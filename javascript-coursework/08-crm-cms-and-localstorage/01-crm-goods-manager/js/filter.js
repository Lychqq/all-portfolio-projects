'use strict';

const All_Students = ['Иванов', 'Петров', 'Сидоров', 'Кузнецов', 'Смирнов', 'Попов', 'Соколов'];
const Failed_Students = ['Сидоров', 'Смирнов', 'Попов' ];

const filter = (All_Students, Failed_Students) => {
    const Succeed_Stydents = All_Students.filter(el_A => !Failed_Students.includes(el_A));
    console.log(Succeed_Stydents);
}

filter(All_Students, Failed_Students);