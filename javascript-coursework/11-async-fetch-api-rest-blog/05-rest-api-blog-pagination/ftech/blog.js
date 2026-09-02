// 1. Получаем номер страницы из URL
const params = new URLSearchParams(window.location.search);
const currentPage = Number(params.get('page')) || 1;

const POSTS_PER_PAGE = 12; 
const TOTAL_PAGES = 10;
const IMAGES_COUNT = 120; // сколько уникальных картинок крутить


const articleImages = [];

for (let i = 0; i < IMAGES_COUNT; i++) {
    articleImages.push(`https://loremflickr.com/400/400?${i + 1}`);
}
// 2. Функция загрузки статей
const loadPosts = async (page = 1) => {
    const response = await fetch(`https://gorest.co.in/public-api/posts?page=${page}&per_page=${POSTS_PER_PAGE}`);
    return await response.json();
};
// 3. Функция отрисовки карточек
const renderPosts = (posts) => {
    const blogList = document.getElementById('blogList');
    blogList.innerHTML = '';

    // Глобальный индекс — учитываем смещение страницы,
    // чтобы картинки продолжали крутиться непрерывно между страницами
    const pageOffset = (currentPage - 1) * POSTS_PER_PAGE;

    const postCards = posts.map((post, index) => {
        const imageUrl = articleImages[pageOffset + index];
        const link = document.createElement('a');
        link.className = 'blog-item-link';
        link.href = `article.html?id=${post.id}`;
        link.innerHTML = `
            <img class="blog-item-image" src="${imageUrl}" alt="${post.title || 'Статья'}">
            <h2 class="blog-item-title">${post.title || 'Без названия'}</h2>
        `;
        return link;
    });

    for (let i = 0; i < postCards.length; i++) {
    blogList.append(postCards[i]);
}
};

// 4. Функция отрисовки пагинации
const renderPagination = (page) => {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    if (page > 1) {
        const prev = document.createElement('a');
        prev.className = 'pagination-link pagination-arrow';
        prev.href = page - 1 === 1 ? 'blog.html' : `blog.html?page=${page - 1}`;
        prev.textContent = '<';
        pagination.append(prev);
    }

    for (let i = 1; i <= TOTAL_PAGES; i += 1) {
        const pageLink = document.createElement('a');
        pageLink.className = 'pagination-link';
        pageLink.href = i === 1 ? 'blog.html' : `blog.html?page=${i}`;
        pageLink.textContent = i;

        if (i === page) {
            pageLink.classList.add('is-active');
        }

        pagination.append(pageLink);
    }

    if (page < TOTAL_PAGES) {
        const next = document.createElement('a');
        next.className = 'pagination-link pagination-arrow';
        next.href = `blog.html?page=${page + 1}`;
        next.textContent = '>';
        pagination.append(next);
    }
};

// 5. Запуск страницы
const initBlogPage = async () => {
    const status = document.getElementById('status');
    status.textContent = 'Загрузка...';

    const payload = await loadPosts(currentPage);

    if (!payload || !Array.isArray(payload.data)) {
        status.textContent = 'Не удалось получить список статей.';
        return;
    }

    status.textContent = '';
    renderPosts(payload.data);
    renderPagination(currentPage);
};

initBlogPage();