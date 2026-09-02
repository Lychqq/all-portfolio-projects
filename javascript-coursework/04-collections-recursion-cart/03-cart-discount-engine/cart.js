'use trict';
const cart = {
    items: [], 
    count: 0, 

    calculateItemPrice() {
          return this.items.reduce((sum, item) => {
            return sum + item.price * item.quantity;
        }, 0);
    },


    increaseCount(number) {
        this.count += number;
    },


    add(name, price, quantity = 1) {
 
        const item = {
            name: name,
            price: price,
            quantity: quantity
        };


        this.items.push(item);


        this.increaseCount(quantity);


        this.calculateItemPrice();
    },


    clear() {
        this.items = [];
        this.totalPrice = 0;
        this.count = 0;
    },


    print() {
         console.log(
        JSON.stringify(
            {
                items: this.items,
                count: this.count,
                totalPrice: this.totalPrice
            },
            null,
            2
        )
    );
}
    
};

Object.defineProperty(cart, 'totalPrice', {
    get() {
        return this.calculateItemPrice();
    },
    enumerable: true
});



cart.add('Стол', 50000, 1);
cart.add('Стул', 1500, 2);
cart.add('Шкаф', 3000, 1);
cart.add('Игровое кресло', 20000, 1);

console.log('Количество товаров до:', cart.count);
cart.increaseCount(5);
console.log('Количество товаров после increaseCount(5):', cart.count);



cart.items;

cart.print();


cart.clear();


cart.print();



cart.totalPrice = 10;
console.log(cart.totalPrice);

