'use strict'

const form = document.querySelector('.my-form');

const sentData = data => console.log('Отправка: ', data);

form.addEventListener('sunmit', e => {
    e.preventDefault();
    // console.log(form.name.value);
    // console.log(form.surname.value);
    // console.log(form.phone.value);

    const checkboxes = new Set();

    [...form.elements].forEach(elem =>{
        if (elem.type === 'checkox') {
            checkboxes.add(elem.name);
        }
    })

    const data = [];
    const formData = new FormData(e.target);

    for (const [name, value] of formData) {
       if(Object.keys(data).includes(name)) {
        if (!Array.isArray(data[name])) {
            data[name] = [data[name]];
        }
        data[name].push(value);
       } else {
        data[name] = value;
       }

         
        console.log(name, value);
    }
    sentData(JSON.stringify(data));
    // console.log([...formData.entries()]);
    // console.log([Object.fromEntries(formData.entries)]);
});

// form.name.addEventListener('focus', e => {
//     console.warn(e.type,e.target.value);
// })
// form.name.addEventListener('blur', e => {
//     console.error(e.type,e.target.value);
// })
// form.name.addEventListener('change', e => {
//     console.log(e.type,e.target.value);
// })



// const fieldsetRadio = document.querySelector('.fieldset-redio');

// form.addEventListener('change',e => {
//     console.log(e.target.value);
// })

// document.addEventListener('keydown', e=>{
//     if (e.code === 'Escape') {
//         form.reset()
//     }
// })