'use strict';

(() => {
    let queue = [1]; 

    const getRandomIntInclusive = () => {
        return Math.floor(Math.random() * 2); 
    }

    const getRandomComputer = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const game = () => {
        const Game_Start = {
            player: 5,
            computer: 5,
        };

        const getWinner = (choice1, choice2) => {

            
            if (queue[0] === 1) { 
                const playerNumber = choice1; 
                const computerGuess = choice2; 
                
                if (computerGuess === 1) { 
                    if (playerNumber % 2 === 1) { 
                        Game_Start.player -= playerNumber;
                        Game_Start.computer += playerNumber;
                        return 'computer';
                    } else {
                        Game_Start.player += playerNumber;
                        Game_Start.computer -= playerNumber;
                        return 'player'; 
                    }
                } else { 
                    if (playerNumber % 2 === 0) { 
                        Game_Start.player -= playerNumber;
                        Game_Start.computer += playerNumber;
                        return 'computer'; 
                    } else {
                        Game_Start.player += playerNumber;
                        Game_Start.computer -= playerNumber;
                        return 'player'; 
                    }
                }
            } else { 
               const computerNumber = choice1;
                const playerGuess = choice2;
                
                if ((playerGuess === true && computerNumber % 2 === 0) || 
                    (playerGuess === false && computerNumber % 2 === 1)) {
                    Game_Start.player += computerNumber;
                    Game_Start.computer -= computerNumber;
                    return 'player';
                } else {
                    Game_Start.player -= computerNumber;
                    Game_Start.computer += computerNumber;
                    return 'computer';
                }
            }
        };

        return function start() {
            if (Game_Start.computer <= 0) {
                alert(
                    `Игра окончена!\n` +
                    `Вы выиграли!`
                );
                return;
            }

            if (Game_Start.player <= 0) {
                alert(
                    `Игра окончена!\n` +
                    `Вы проиграли!`
                );
                return;
            }

            const computerChoice = getRandomIntInclusive(); 
            const computerChosenNumber = getRandomComputer(1, Game_Start.computer); 
            
            let winner;
            let playerChoiceNumber;
            let playerChoice;

            if (queue[0] === 1) {

                playerChoiceNumber = parseInt(prompt(
                    `Загадайте число от 1 до ${Game_Start.player} : `));
                
                if (isNaN(playerChoiceNumber) || playerChoiceNumber < 1 || playerChoiceNumber > Game_Start.player) {
                    alert('Неверный ввод! Введите число в допустимом диапазоне.');
                    return start();
                }
                
                winner = getWinner(playerChoiceNumber, computerChoice);
                queue[0] = 0; 
                
                if (winner === 'player') {
                    alert(
                        `Вы загадали: ${playerChoiceNumber}\n` +
                        `Компьютер выбрал: ${computerChoice === 1 ? 'нечетное' : 'четное'}\n` +
                        `Вы выиграли!`
                    );
                } else {
                    alert(
                        `Вы загадали: ${playerChoiceNumber}\n` +
                        `Компьютер выбрал: ${computerChoice === 1 ? 'нечетное' : 'четное'}\n` +
                        `Компьютер выиграл!`
                    );
                }
            } else {

                playerChoice = confirm(
                    `Угадай какое число загадал компьютер \n\n` +
                    `OK - число четное\n` +
                    `Cancel - число нечетное`
                );
                
                winner = getWinner(computerChosenNumber, playerChoice);

                
                queue[0] = 1; 
                
                if (winner === 'player') {
                    alert(
                        `Вы выбрали: ${playerChoice ? 'четное' : 'нечетное'}\n` +
                        `Компьютер загадал: ${computerChosenNumber}\n` +
                        `Вы выиграли!`
                    );
                } else {
                    alert(
                        `Вы выбрали: ${playerChoice ? 'четное' : 'нечетное'}\n` +
                        `Компьютер загадал: ${computerChosenNumber}\n` +
                        `Компьютер выиграл!`
                    );
                }
            }
            
            return start();
        };
    };

    window.RPS = game;
})();