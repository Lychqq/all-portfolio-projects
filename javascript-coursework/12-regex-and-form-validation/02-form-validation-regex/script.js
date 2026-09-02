const form = document.getElementById('form')

const nameInput = document.getElementById('name')
const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')
const birthInput = document.getElementById('birth')
const phoneInput = document.getElementById('phone')

const nameError = document.getElementById('nameError')
const emailError = document.getElementById('emailError')
const passwordError = document.getElementById('passwordError')
const birthError = document.getElementById('birthError')
const phoneError = document.getElementById('phoneError')

form.addEventListener('submit', (e) => {

    e.preventDefault()

    let valid = true

    const nameRegex = /^[А-Яа-яA-Za-z]{2,}$/
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const passwordRegex = /^.{6,}$/
    const birthRegex = /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/
    const phoneRegex = /^\+7\d{10}$/

    nameInput.classList.remove('error')
    emailInput.classList.remove('error')
    passwordInput.classList.remove('error')
    birthInput.classList.remove('error')
    phoneInput.classList.remove('error')

    nameError.textContent = ''
    emailError.textContent = ''
    passwordError.textContent = ''
    birthError.textContent = ''
    phoneError.textContent = ''

    if(!nameRegex.test(nameInput.value)){

        nameInput.classList.add('error')

        nameError.textContent = 'Введите корректное имя'

        valid = false
    }

    if(!emailRegex.test(emailInput.value)){

        emailInput.classList.add('error')

        emailError.textContent = 'Введите корректный email'

        valid = false
    }

    if(!passwordRegex.test(passwordInput.value)){

        passwordInput.classList.add('error')

        passwordError.textContent = 'Минимум 8 символов'

        valid = false
    }

    if(!birthRegex.test(birthInput.value)){

        birthInput.classList.add('error')

        birthError.textContent = 'Введите дату в формате DD.MM.YYYY'

        valid = false

    }else{

        const parts = birthInput.value.split('.')

        const userDate = new Date(parts[2], parts[1] - 1, parts[0])

        const maxDate = new Date(2026, 4, 15)

        if(userDate > maxDate){

            birthInput.classList.add('error')

            birthError.textContent = 'Дата больше 15.05.2026'

            valid = false
        }
    }

    if(!phoneRegex.test(phoneInput.value)){

        phoneInput.classList.add('error')

        phoneError.textContent = 'Введите номер в формате +79991234567'

        valid = false
    }

    if(valid){

        console.log('Форма отправлена')
    }

})