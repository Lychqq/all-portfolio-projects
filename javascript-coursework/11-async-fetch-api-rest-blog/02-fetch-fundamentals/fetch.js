const formData = new FormData();
formData.append('userName', 'john');
formData.append('dob', '23.04.2007');
console.dir(formData);


fetch('url', {
    method: 'POST',
    body: formData
})
.then(response => response.json())
.then(data => console.log(data))