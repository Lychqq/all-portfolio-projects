'use strict';

(() => {
  const FIGURES = ['камень', 'ножницы', 'бумага'];

  const getRandomIntInclusive = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const game = () => {
    const result = {
      player: 0,
      computer: 0,
    };

    const getWinner = (player, computer) => {
      if (player === computer) return 'draw';

      if (
        (player === 'камень' && computer === 'ножницы') ||
        (player === 'ножницы' && computer === 'бумага') ||
        (player === 'бумага' && computer === 'камень')
      ) {
        return 'player';
      }
      return 'computer';
    };

    return function start() {
      const playerChoice = prompt(
        'Сделайте выбор: камень, ножницы или бумага'
      );

      if (playerChoice === null) {
        const isExit = confirm('Вы точно хотите выйти?');

        if (isExit) {
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

      if (!FIGURES.includes(choice)) {
        alert('Неверный ввод!');
        return start();
      }

      const computerChoice =
        FIGURES[getRandomIntInclusive(0, FIGURES.length - 1)];

      const winner = getWinner(choice, computerChoice);

      if (winner === 'player') result.player++;
      if (winner === 'computer') result.computer++;

      alert(
        `Вы выбрали: ${choice}\n` +
        `Компьютер выбрал: ${computerChoice}\n\n` +
        (winner === 'draw'
          ? 'Ничья!'
          : winner === 'player'
          ? 'Вы выиграли!'
          : 'Компьютер выиграл!')
      );

      return start();
    };
  };

  window.RPS = game;
})();