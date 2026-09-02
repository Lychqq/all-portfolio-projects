'use strict';

const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.querySelector('#startBtn')
const stopBtn = document.querySelector('#stopBtn')


// Исправлена опечатка в названии (было positon)
let position = 50; 
let direction = 1; 
let animationId = null;
let isAnimating =false; // Флаг для контроля анимации

const squareSize = 50;

const draw = () => {
    // 1. Очищаем холст
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Рисуем сетку
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    for (let i = 0; i <= canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    // 3. Рисуем направляющую линию посередине
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.strokeStyle = '#ddd';
    ctx.stroke();

    // 4. Рисуем границы холста
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // 5. Рисуем квадрат (используем переменную position)
    // Центрируем квадрат по вертикали: (canvas.height / 2) - (squareSize / 2)
    ctx.fillStyle = '#667eea';
    ctx.fillRect(position, (canvas.height / 2) - (squareSize / 2), squareSize, squareSize);
    
    ctx.strokeStyle = '#764ba2';
    ctx.lineWidth = 2;
    ctx.strokeRect(position, (canvas.height / 2) - (squareSize / 2), squareSize, squareSize);

    // 6. Рисуем круг (опционально, оставил из вашего кода)
    ctx.beginPath();
    ctx.arc(position + 25, 200, 25, 0, Math.PI * 2); 
    ctx.fillStyle = '#ca498d';
    ctx.fill();
};

const update = () => {
    // Обновляем позицию
    position += 5 * direction;

    // Проверяем границы (отскок)
    if (position + squareSize > canvas.width) {
        position = canvas.width - squareSize;
        direction = -1;
    } else if (position < 0) {
        position = 0;
        direction = 1;
    }
};

const startAnimate = () => {
    if (!isAnimating) return;
    
    update(); // Сначала считаем
    draw();   // Потом рисуем
    
    animationId = requestAnimationFrame(startAnimate);
};

// Запуск
startBtn.addEventListener('click',startAnimate)
startAnimate();
