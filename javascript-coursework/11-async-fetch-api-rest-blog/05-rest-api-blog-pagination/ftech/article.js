// 1. Читаем id статьи из URL
const params = new URLSearchParams(window.location.search);
const articleId = params.get('id');

// 2. Функция загрузки статьи
const loadArticle = async (id) => {
        const response = await fetch(`https://gorest.co.in/public-api/posts/${id}`);
        return await response.json();

};

// 3. Функция загрузки автора
const loadAuthor = async (userId) => {
        const response = await fetch(`https://gorest.co.in/public-api/users/${userId}`);
        return await response.json();
};

// 4. Функция отрисовки страницы
const renderArticle = (article, author) => {
    document.getElementById('articleTitle').textContent = article.title || 'Без названия';
    document.getElementById('articleBody').textContent = article.body || 'Текст статьи отсутствует.';
    document.getElementById('authorName').textContent = author?.name || 'Автор не найден';
    document.getElementById('authorEmail').textContent = author?.email || '';
};

// 5. Запуск страницы
const initArticlePage = async () => {
    const status = document.getElementById('status');
    const articleContainer = document.getElementById('articleContainer');


    status.textContent = 'Загрузка статьи...';

    const articlePayload = await loadArticle(articleId);
    const articleData = articlePayload?.data;

    if (!articleData) {
        status.textContent = 'Статья не найдена или недоступна.';
        return;
    }

    const authorPayload = await loadAuthor(articleData.user_id);
    const authorData = authorPayload?.data || null;

    renderArticle(articleData, authorData);
    articleContainer.hidden = false;
    status.textContent = '';
};

initArticlePage();
