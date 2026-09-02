const loadGoods = async () => {
    const result = await fetch('http://localhost:3000/api/goods');
    const data = await result.json();
    console.log('data:', data);
}
loadGoods();