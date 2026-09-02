'use strict';

// fetch('http://localhost:3000/api/goods/1732512010', {
//     method: 'PATCH',
//     body: JSON.stringify({
//     title: 'Манго',
//     description: 'Бог Шива захотел порадовать свою возлюбленную и вырастил',
//     category: 'fruit',
//     price: 1600,
//     units: 'кг',
//     count: 26,
//     }),
//     headers:{
//         'Content-Type': 'application/json'
//     }
// });

// fetch('http://localhost:3000/api/goods')

// Было: const renderGoods = async (data) => {
// Стало: (просто пустые скобки)
// 1. Сначала объявляем функцию загрузки
const loadGoods = async () => {
    try {
        const result = await fetch('http://localhost:3000/api/goods');
        if (!result.ok) throw new Error('Ошибка сервера');
        return await result.json();
    } catch (err) {
        console.error('Не удалось загрузить данные:', err);
        return []; // Возвращаем пустой массив в случае беды
    }
};

// 2. Затем объявляем функцию отрисовки
const renderGoods = async () => {
    const data = await loadGoods(); // Теперь она точно определена выше
    
    // Проверка: если пришел объект с массивом внутри (например, {goods: []})
    const items = Array.isArray(data) ? data : (data.goods || []);

    const cardsWrapper = document.createElement('div');
    cardsWrapper.className = 'cards';

    const goods = items.map(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h2>${item.title || 'Без названия'}</h2>
            <p>Цена: ${item.price || 0}P</p>
            <p>${item.description || ''}</p>
        `;
        return card;
    });

    cardsWrapper.append(...goods);
    document.body.append(cardsWrapper);
};

// 3. И только в самом конце запускаем всё
renderGoods();
