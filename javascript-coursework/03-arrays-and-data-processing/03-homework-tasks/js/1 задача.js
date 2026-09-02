'use strict';

function powersTable(maxA = 10, maxM = 10) {
  //Заголовок столбцов
  const header = ['a\\m'];
  for (let m = 1; m <= maxM; m++) header.push(String(m));

  const rows = [];
  for (let a = 1; a <= maxA; a++) {
    const row = [String(a)]; //первая ячейка - base
    for (let m = 1; m <= maxM; m++) {
      row.push(Math.pow(a, m)); //a^m
    }
    rows.push(row);
  }

  //Вывод: сначала заголовок, затем строки
  console.log(header.join('\t'));
  for (let i = 0; i < rows.length; i++) {
    console.log(rows[i].join('\t'));
  }


}

powersTable();