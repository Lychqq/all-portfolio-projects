const file = document.querySelector('.file');
const preview = document.querySelector('.preview');
const form = document.querySelector('.form-input');

const toBase64 = file =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.addEventListener('loadend', () => {
            resolve(reader.result);
        });

        reader.addEventListener('error', err => {
            reject(err);
        });

        reader.readAsDataURL(file);
    });

file.addEventListener('change', () => {
    if (file.files.length > 0) {
        const src = URL.createObjectURL(file.files[0]);

        preview.style.display = 'block';
        preview.src = src;
    }
});

form.addEventListener('submit', async event => {
    event.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    console.log('data:', data);

    data.image = await toBase64(data.image);

    console.log('data:', data);

    fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json; charset=UTF-8'
        }
    })
        .then(response => response.json())
        .then(result => console.log(result))
        .catch(error => console.error(error));
});