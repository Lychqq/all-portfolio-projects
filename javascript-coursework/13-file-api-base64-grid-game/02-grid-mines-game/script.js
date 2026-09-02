let S;
  let MAX;
  let WIN_COUNT;

  let attempts = 0;
  let wins = 0;

  const table = document.querySelector('.grid');

  const info = document.querySelector('.info');

  document.querySelector('.start-btn').addEventListener('click', () => {

    S = parseInt(document.querySelector('.size-input').value);

    MAX = parseInt(document.querySelector('.attempts-input').value);

    WIN_COUNT = parseInt(document.querySelector('.wins-input').value);

    if (
      isNaN(S) ||
      isNaN(MAX) ||
      isNaN(WIN_COUNT) ||
      S <= 0 ||
      MAX <= 0 ||
      WIN_COUNT <= 0 ||
      WIN_COUNT > S * S
    ) {
      alert('Некорректные данные');
      return;
    }

    startGame();

  });

  const startGame = () => {

    table.innerHTML = '';

    attempts = 0;

    wins = 0;

    table.style.pointerEvents = 'auto';

    info.textContent = `Осталось попыток: ${MAX}`;

    const winning = new Set();

    while (winning.size < WIN_COUNT) {
      const r = Math.floor(Math.random() * S);
      const c = Math.floor(Math.random() * S);
      winning.add(r + ',' + c);

    }

    for (let r = 0; r < S; r++) {

      const tr = table.insertRow();

      for (let c = 0; c < S; c++) {

        const td = tr.insertCell();

        td.dataset.key = r + ',' + c;

        td.addEventListener('click', () => {

          if (td.classList.contains('done')) return;

          td.classList.add('done');

          attempts++;

          if (winning.has(td.dataset.key)) {
            td.textContent = '★';
            td.classList.add('win');
            wins++;
            end('Победа! Вы нашли выигрышную клетку.');
            return;
          }

          td.textContent = '·';
          td.classList.add('miss');
          if (attempts >= MAX) {
            end('Попытки закончились. Вы проиграли.');

          } else {

            info.textContent = `Осталось попыток: ${MAX - attempts}`;

          }

        });

      }

    }

    const end = (msg) => {

      info.textContent = msg;

      table.style.pointerEvents = 'none';

      winning.forEach(key => {

        const td = table.querySelector(`[data-key="${key}"]`);

        if (!td.classList.contains('win')) {

          td.textContent = '★';

          td.style.color = '#ccc';

        }

      });

    };

  };

