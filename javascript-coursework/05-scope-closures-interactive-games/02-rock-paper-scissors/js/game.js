'use strict';

(() => {
  const FIGURES = ['камень', 'ножницы', 'бумага'];
  const FIGURES_EN = ['rock', 'scissors', 'paper']

  const getRandomIntInclusive = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const game = (language) => {
    let figure;
     if (language === 'EN' || language === 'ENG') {
        figure = FIGURES_EN;
     } else {
        figure = FIGURES;
     }

    
    const result = {
      player: 0,
      computer: 0,
    };

    const getWinner = (player, computer) => {
      if (player === computer) return 'ничья';

      if (
        (player === figure[0] && computer === figure[1]) ||
        (player === figure[1] && computer === figure[2]) ||
        (player === figure[2] && computer === figure[0])
      ) {
        return 'player';
      }
      return 'computer';
    };

    return function start() {
      const playerChoice = prompt(
        'Сделайте выбор: ' + figure.join(', ')
      );

      if (playerChoice === null) {
        const Exit = confirm('Вы точно больше не хотите играть?((');

        if (Exit) {
          alert(
            `Игра окончена!\n\n` +
            `Игрок: ${result.player}\n` +
            `Компьютер: ${result.computer}`
          );
          return;
        }

        return start();
      }

      const choice = playerChoice.toLowerCase();

      if (!figure.includes(choice)) {
        alert('Неверный ввод!');
        return start();
      }

      const computerChoice =
        figure[getRandomIntInclusive(0, figure.length - 1)];

      const winner = getWinner(choice, computerChoice);

      if (winner === 'player') {
        result.player++;
        alert(
          `Вы выбрали: ${choice} \n` +
          `Компьютер выбрал: ${computerChoice} \n` +
          `Вы выиграли!`
        );
      } else if (winner === 'computer') {
        result.computer++;
        alert(
          `Вы выбрали: ${choice}\n` +
          `Компьютер выбрал: ${computerChoice}\n` +
          `Компьютер выиграл!`
        );
      } else {
        alert(
          `Вы выбрали:  ${choice}\n` +
          `Компьютер выбрал: ${computerChoice}\n` +
          `Ничья!`
        );
      }

      return start();
    };
  };

  window.RPS = game;
})();