const loadGoods = (callback) => {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://cryptic-temple-67554.herokuapp.com/api');

  xhr.addEventListener('load', () => {
    const data = JSON.parse(xhr.response);
    callback(data);
  });

  xhr.addEventListener('error', () => {
    console.log('error');
  });

  xhr.send();
};

const sendData = (body, callback) => {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://typicode.com');

  xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

  xhr.addEventListener('load', () => {
    const data = JSON.parse(xhr.response);
    callback(data);
  });

  xhr.addEventListener('error', () => {
    console.log('error');
  });

  xhr.send(JSON.stringify(body));
};

const renderGoods = (data) => {
  const cardsWrapper = document.createElement('div');
  cardsWrapper.className = 'cards';

  const goods = data.map(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h2>${item.title}</h2>
      <br>
      <p>Цена: ${item.price} Р</p>
      <br>
      <p>${item.description}</p>
    `;
    return card;
  });

  cardsWrapper.append(...goods);
  document.body.append(cardsWrapper);
};

const get = document.querySelector('#get');

get.addEventListener('click', () => {
  loadGoods(renderGoods);
});
