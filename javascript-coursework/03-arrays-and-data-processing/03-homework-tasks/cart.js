// Объект корзины
const cart = {
    // Свойства
    items: [], // массив товаров
    totalPrice: 0, // общая стоимость корзины
    count: 0, // количество товаров

    // Метод получения общей стоимости
    getTotalPrice() {
        return this.totalPrice;
    },

    // Метод пересчета стоимости корзины
    calculateItemPrice() {
        this.totalPrice = this.items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);
    },

    // Метод увеличения количества товаров
    increaseCount(number) {
        this.count += number;
    },

    // Метод добавления товара
    add(name, price, quantity = 1) {
        // Формируем объект товара
        const item = {
            name: name,
            price: price,
            quantity: quantity
        };

        // Добавляем товар в корзину
        this.items.push(item);

        // Обновляем количество товаров
        this.increaseCount(quantity);

        // Пересчитываем общую стоимость
        this.calculateItemPrice();
    },

    // Метод очистки корзины
    clear() {
        this.items = [];
        this.totalPrice = 0;
        this.count = 0;
    },

    // Метод вывода информации о корзине
    print() {
        console.log('Товары в корзине:');
        this.items.forEach((item, index) => {
            console.log(`${index + 1}. ${item.name} - ${item.price} руб. x ${item.quantity} шт. = ${item.price * item.quantity} руб.`);
        });
        console.log('Общая стоимость корзины:', this.getTotalPrice());
    }
};

// Тестирование функционала
// Добавляем товары в корзину
cart.add('Ноутбук', 50000, 1);
cart.add('Мышь', 1500, 2);
cart.add('Клавиатура', 3000, 1);
cart.add('Монитор', 20000, 1);

// Проверка метода increaseCount
console.log('Количество товаров до:', cart.count);
cart.increaseCount(5);
console.log('Количество товаров после increaseCount(5):', cart.count);
cart.increaseCount(3);
console.log('Количество товаров после increaseCount(3):', cart.count);


// Посмотреть все товары
cart.items;

cart.print();

// Очистить корзину
cart.clear();

// Выводим информацию о корзине
cart.print();

