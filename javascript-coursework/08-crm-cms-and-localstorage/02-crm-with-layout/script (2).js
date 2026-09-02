'use strict';



const data = [];



const createPage = () => {
    const page = document.createElement('div');
    page.classList.add('page');
    return page;
};

const createTopBar = () => {
    const topBar = document.createElement('div');
    topBar.classList.add('top-bar');

    const title = document.createElement('span');
    title.classList.add('cms-title');
    title.textContent = 'CMS';

    const total = document.createElement('span');
    total.classList.add('top-total');
    total.innerHTML = 'Итоговая стоимость: <strong id="top-total">$0.00</strong>';

    topBar.append(title, total);
    return topBar;
};

const createToolbar = () => {
    const toolbar = document.createElement('div');
    toolbar.classList.add('toolbar');

    const filterBtn = document.createElement('button');
    filterBtn.classList.add('filter-btn');
    filterBtn.type = 'button';
    filterBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
        Фильтр`;

    const searchWrap = document.createElement('div');
    searchWrap.classList.add('search-wrap');
    searchWrap.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5"/>
        <line x1="11" y1="11" x2="15" y2="15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`;

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Поиск по наименованию и категории';
    searchWrap.append(searchInput);

    const addBtn = document.createElement('button');
    addBtn.classList.add('add-btn');
    addBtn.type = 'button';
    addBtn.textContent = 'ДОБАВИТЬ ТОВАР';

    toolbar.append(filterBtn, searchWrap, addBtn);

    toolbar.searchInput = searchInput;
    toolbar.addBtn = addBtn;

    return toolbar;
};

const createTable = () => {
    const tableWrap = document.createElement('div');
    tableWrap.classList.add('table-wrap');

    const table = document.createElement('table');

    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>ID</th>
            <th class="sortable" data-sort="name">НАИМЕНОВАНИЕ</th>
            <th>КАТЕГОРИЯ</th>
            <th>ЕД/ИЗМ</th>
            <th>КОЛИЧЕСТВО</th>
            <th>ЦЕНА</th>
            <th>ИТОГ</th>
            <th></th>
        </tr>`;

    const tbody = document.createElement('tbody');

    table.append(thead, tbody);
    tableWrap.append(table);

    tableWrap.tbody = tbody;
    tableWrap.thead = thead;

    return tableWrap;
};

const createPagination = () => {
    const pag = document.createElement('div');
    pag.classList.add('pagination');

    const perWrap = document.createElement('div');
    perWrap.classList.add('per-page-wrap');
    perWrap.innerHTML = 'Показывать на странице:';

    const perSelect = document.createElement('select');

    const opt10 = document.createElement('option');
    opt10.value = 10;
    opt10.textContent = 10;

    const opt20 = document.createElement('option');
    opt20.value = 20;
    opt20.textContent = 20;

    const opt50 = document.createElement('option');
    opt50.value = 50;
    opt50.textContent = 50;

    perSelect.append(opt10, opt20, opt50);
    perWrap.append(perSelect);

    const pgInfo = document.createElement('span');
    pgInfo.classList.add('pg-info');

    const btnPrev = document.createElement('button');
    btnPrev.classList.add('pg-btn');
    btnPrev.innerHTML = '&#8249;';
    btnPrev.disabled = true;

    const btnNext = document.createElement('button');
    btnNext.classList.add('pg-btn');
    btnNext.innerHTML = '&#8250;';
    btnNext.disabled = true;

    pag.append(perWrap, pgInfo, btnPrev, btnNext);

    pag.perSelect = perSelect;
    pag.pgInfo    = pgInfo;
    pag.btnPrev   = btnPrev;
    pag.btnNext   = btnNext;

    return pag;
};



const createOverlay = () => {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');

    const modal = document.createElement('div');
    modal.classList.add('modal');

    // шапка
    const modalHead = document.createElement('div');
    modalHead.classList.add('modal-head');

    const headLeft = document.createElement('div');

    const modalTitle = document.createElement('div');
    modalTitle.classList.add('modal-title');
    modalTitle.textContent = 'ДОБАВИТЬ ТОВАР';

    const modalId = document.createElement('div');
    modalId.classList.add('modal-id');

    headLeft.append(modalTitle, modalId);

    const xBtn = document.createElement('button');
    xBtn.classList.add('x-btn');
    xBtn.type = 'button';
    xBtn.textContent = '×';

    modalHead.append(headLeft, xBtn);

    // разделитель
    const divider = document.createElement('div');
    divider.classList.add('modal-divider');

    // тело формы
    const formInner = document.createElement('div');
    formInner.classList.add('form-inner');

    const formLayout = document.createElement('div');
    formLayout.classList.add('form-layout');

    // левая колонка
    const colLeft = document.createElement('div');

    const fieldName = document.createElement('div');
    fieldName.classList.add('field');
    fieldName.innerHTML = '<label>НАИМЕНОВАНИЕ</label>';
    const inputName = document.createElement('input');
    inputName.type = 'text';
    fieldName.append(inputName);

    const fieldCat = document.createElement('div');
    fieldCat.classList.add('field');
    fieldCat.innerHTML = '<label>КАТЕГОРИЯ</label>';
    const inputCat = document.createElement('input');
    inputCat.type = 'text';
    fieldCat.append(inputCat);

    const fieldUnit = document.createElement('div');
    fieldUnit.classList.add('field');
    fieldUnit.innerHTML = '<label>ЕДИНИЦЫ ИЗМЕРЕНИЯ</label>';
    const inputUnit = document.createElement('input');
    inputUnit.type = 'text';
    fieldUnit.append(inputUnit);

    // дисконт
    const discountField = document.createElement('div');
    discountField.classList.add('discount-field');

    const discountLabel = document.createElement('label');
    discountLabel.textContent = 'ДИСКОНТ';

    const discountRow = document.createElement('div');
    discountRow.classList.add('discount-row');

    const checkbox = document.createElement('div');
    checkbox.classList.add('checkbox', 'on');
    checkbox.innerHTML = `<svg width="13" height="10" viewBox="0 0 13 10" fill="none">
        <path d="M1 5l4 4L12 1" stroke="#6b5ce7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    const inputDiscount = document.createElement('input');
    inputDiscount.type = 'text';

    discountRow.append(checkbox, inputDiscount);
    discountField.append(discountLabel, discountRow);

    colLeft.append(fieldName, fieldCat, fieldUnit, discountField);

    // правая колонка
    const colRight = document.createElement('div');

    const fieldDesc = document.createElement('div');
    fieldDesc.classList.add('field');
    fieldDesc.innerHTML = '<label>ОПИСАНИЕ</label>';
    const inputDesc = document.createElement('textarea');
    fieldDesc.append(inputDesc);

    const fieldQty = document.createElement('div');
    fieldQty.classList.add('field');
    fieldQty.innerHTML = '<label>КОЛИЧЕСТВО</label>';
    const inputQty = document.createElement('input');
    inputQty.type = 'number';
    fieldQty.append(inputQty);

    const fieldPrice = document.createElement('div');
    fieldPrice.classList.add('field');
    fieldPrice.innerHTML = '<label>ЦЕНА</label>';
    const inputPrice = document.createElement('input');
    inputPrice.type = 'number';
    fieldPrice.append(inputPrice);

    const addImgWrap = document.createElement('div');
    addImgWrap.classList.add('add-img-wrap');
    const addImgBtn = document.createElement('button');
    addImgBtn.classList.add('add-img-btn');
    addImgBtn.type = 'button';
    addImgBtn.textContent = 'ДОБАВИТЬ ИЗОБРАЖЕНИЕ';
    addImgWrap.append(addImgBtn);

    colRight.append(fieldDesc, fieldQty, fieldPrice, addImgWrap);

    formLayout.append(colLeft, colRight);
    formInner.append(formLayout);

    // футер модалки
    const modalFoot = document.createElement('div');
    modalFoot.classList.add('modal-foot');

    const modalTotal = document.createElement('span');
    modalTotal.classList.add('modal-total');
    modalTotal.innerHTML = 'Итоговая стоимость: <strong id="modal-total">$0.00</strong>';

    const submitBtn = document.createElement('button');
    submitBtn.classList.add('submit-btn');
    submitBtn.type = 'button';
    submitBtn.textContent = 'ДОБАВИТЬ ТОВАР';

    modalFoot.append(modalTotal, submitBtn);

    modal.append(modalHead, divider, formInner, modalFoot);
    overlay.append(modal);

    
    overlay.modalTitle  = modalTitle;
    overlay.modalId     = modalId;
    overlay.xBtn        = xBtn;
    overlay.checkbox    = checkbox;
    overlay.submitBtn   = submitBtn;
    overlay.inputName   = inputName;
    overlay.inputCat    = inputCat;
    overlay.inputUnit   = inputUnit;
    overlay.inputDesc   = inputDesc;
    overlay.inputQty    = inputQty;
    overlay.inputPrice  = inputPrice;

    return overlay;
};

/* СОЗДАНИЕ СТРОКИ */

const createRow = (item) => {
    const tr = document.createElement('tr');

    const tdId = document.createElement('td');
    tdId.classList.add('td-id');
    tdId.textContent = item.id;

    const tdName = document.createElement('td');
    tdName.textContent = item.name;

    const tdCat = document.createElement('td');
    tdCat.textContent = item.cat;

    const tdUnit = document.createElement('td');
    tdUnit.classList.add('td-unit');
    tdUnit.textContent = item.unit;

    const tdQty = document.createElement('td');
    tdQty.textContent = item.qty;

    const tdPrice = document.createElement('td');
    tdPrice.textContent = '$' + item.price;

    const tdTotal = document.createElement('td');
    tdTotal.classList.add('td-total');
    tdTotal.textContent = '$' + (item.qty * item.price);

    const tdActs = document.createElement('td');
    const actWrap = document.createElement('div');
    actWrap.classList.add('row-actions');

    const btnImg = document.createElement('button');
    btnImg.classList.add('icon-btn');
    btnImg.title = 'Изображение';
    btnImg.innerHTML = `<svg class="svg-icon svg-icon--img" viewBox="0 0 18 18" fill="none">
        <!-- вставь свой svg сюда -->
        <rect x="1" y="3" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.4"/>
        <path d="M1 11l4-4 3 3 3-4 6 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        <circle cx="5.5" cy="7.5" r="1" fill="currentColor"/>
    </svg>`;

    const btnEdit = document.createElement('button');
    btnEdit.classList.add('icon-btn');
    btnEdit.title = 'Редактировать';
    btnEdit.innerHTML = `<svg class="svg-icon svg-icon--edit" viewBox="0 0 18 18" fill="none">
        <!-- вставь свой svg сюда -->
        <path d="M12 3l3 3-8 8H4v-3l8-8z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    const btnDel = document.createElement('button');
    btnDel.classList.add('icon-btn', 'del-btn');
    btnDel.title = 'Удалить';
    btnDel.innerHTML = `<svg class="svg-icon svg-icon--del" viewBox="0 0 18 18" fill="none">
        <!-- вставь свой svg сюда -->
        <path d="M3 5h12M7 5V3h4v2M5 5l1 10h6l1-10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    actWrap.append(btnImg, btnEdit, btnDel);
    tdActs.append(actWrap);

    tr.append(tdId, tdName, tdCat, tdUnit, tdQty, tdPrice, tdTotal, tdActs);

    tr.tdName  = tdName;
    tr.tdCat   = tdCat;
    tr.tdUnit  = tdUnit;
    tr.tdQty   = tdQty;
    tr.tdPrice = tdPrice;
    tr.tdTotal = tdTotal;
    tr.btnEdit = btnEdit;
    tr.btnDel  = btnDel;
    tr.item    = item;

    return tr;
};

/*ИНИЦИАЛИЗАЦИЯ */

const init = (selector) => {
    const app = document.querySelector(selector);

    const page      = createPage();
    const topBar    = createTopBar();
    const card      = document.createElement('div');
    card.classList.add('card');
    const toolbar   = createToolbar();
    const tableWrap = createTable();
    const pag       = createPagination();
    const overlay   = createOverlay();

    card.append(toolbar, tableWrap, pag);
    page.append(topBar, card, overlay);
    app.append(page);

    const tbody      = tableWrap.tbody;
    const thead      = tableWrap.thead;
    const topTotal   = document.getElementById('top-total');
    const modalTotal = document.getElementById('modal-total');

    let filtered    = [...data];
    let currentPage = 1;
    let perPage     = 10;
    let editingRow  = null;
    let sortAsc     = true;

    // пересчёт суммы
    const updateTotal = () => {
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i].qty * data[i].price;
        }
        topTotal.textContent   = '$' + sum.toFixed(2);
        modalTotal.textContent = '$' + sum.toFixed(2);
    };

    // отрисовка таблицы
    const renderTable = () => {
        const start = (currentPage - 1) * perPage;
        const end   = start + perPage;
        const slice = filtered.slice(start, end);

        tbody.innerHTML = '';

        if (slice.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.classList.add('empty-td');
            td.colSpan = 8;
            td.textContent = 'Товаров нет — нажмите «ДОБАВИТЬ ТОВАР»';
            tr.append(td);
            tbody.append(tr);
        } else {
            for (let i = 0; i < slice.length; i++) {
                const item = slice[i];
                const row  = createRow(item);

                row.btnEdit.addEventListener('click', function () {
                    editingRow = row;
                    overlay.modalTitle.textContent = 'ИЗМЕНИТЬ ТОВАР';
                    overlay.modalId.textContent    = 'ID: ' + item.id;
                    overlay.submitBtn.textContent  = 'СОХРАНИТЬ';
                    overlay.inputName.value  = item.name;
                    overlay.inputCat.value   = item.cat;
                    overlay.inputUnit.value  = item.unit;
                    overlay.inputDesc.value  = item.desc;
                    overlay.inputQty.value   = item.qty;
                    overlay.inputPrice.value = item.price;
                    if (item.discount) {
                        overlay.checkbox.classList.add('on');
                    } else {
                        overlay.checkbox.classList.remove('on');
                    }
                    overlay.classList.add('open');
                });

                row.btnDel.addEventListener('click', function () {
                    const idx = data.indexOf(item);
                    data.splice(idx, 1);
                    filtered = data.slice();
                    renderTable();
                    updateTotal();
                });

                tbody.append(row);
            }
        }

        const total = filtered.length;

        if (total === 0) {
            pag.pgInfo.textContent = '0 of 0';
        } else {
            pag.pgInfo.textContent = (start + 1) + '-' + Math.min(end, total) + ' of ' + total;
        }

        if (currentPage === 1) {
            pag.btnPrev.disabled = true;
        } else {
            pag.btnPrev.disabled = false;
        }

        if (end >= total) {
            pag.btnNext.disabled = true;
        } else {
            pag.btnNext.disabled = false;
        }
    };

    renderTable();

    // поиск
    toolbar.searchInput.addEventListener('input', function () {
        const q = this.value.toLowerCase();
        filtered = [];
        for (let i = 0; i < data.length; i++) {
            const nameMatch = data[i].name.toLowerCase().includes(q);
            const catMatch  = data[i].cat.toLowerCase().includes(q);
            if (nameMatch || catMatch) {
                filtered.push(data[i]);
            }
        }
        currentPage = 1;
        renderTable();
    });

    // пагинация
    pag.btnPrev.addEventListener('click', function () {
        currentPage--;
        renderTable();
    });

    pag.btnNext.addEventListener('click', function () {
        currentPage++;
        renderTable();
    });

    pag.perSelect.addEventListener('change', function () {
        perPage = Number(this.value);
        currentPage = 1;
        renderTable();
    });

    // сортировка по имени
    thead.addEventListener('click', function (e) {
        const th = e.target.closest('[data-sort]');
        if (!th) return;

        if (sortAsc) {
            filtered.sort(function (a, b) {
                return a.name.localeCompare(b.name, 'ru');
            });
            sortAsc = false;
        } else {
            filtered.sort(function (a, b) {
                return b.name.localeCompare(a.name, 'ru');
            });
            sortAsc = true;
        }

        currentPage = 1;
        renderTable();
    });

    // открыть модалку — добавить
    toolbar.addBtn.addEventListener('click', function () {
        editingRow = null;
        overlay.modalTitle.textContent = 'ДОБАВИТЬ ТОВАР';
        overlay.modalId.textContent    = '';
        overlay.submitBtn.textContent  = 'ДОБАВИТЬ ТОВАР';
        overlay.inputName.value  = '';
        overlay.inputCat.value   = '';
        overlay.inputUnit.value  = '';
        overlay.inputDesc.value  = '';
        overlay.inputQty.value   = '';
        overlay.inputPrice.value = '';
        overlay.checkbox.classList.add('on');
        overlay.classList.add('open');
    });

    // закрыть по крестику
    overlay.xBtn.addEventListener('click', function () {
        overlay.classList.remove('open');
    });

    // закрыть по клику на фон
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
            overlay.classList.remove('open');
        }
    });

    // чекбокс дисконт
    overlay.checkbox.addEventListener('click', function () {
        this.classList.toggle('on');
    });

    // добавить / сохранить
    overlay.submitBtn.addEventListener('click', function () {
        const name     = overlay.inputName.value.trim();
        const cat      = overlay.inputCat.value.trim();
        const unit     = overlay.inputUnit.value.trim();
        const desc     = overlay.inputDesc.value.trim();
        const qty      = parseInt(overlay.inputQty.value);
        const price    = parseFloat(overlay.inputPrice.value);
        const discount = overlay.checkbox.classList.contains('on');

        if (!name) {
            overlay.inputName.focus();
            return;
        }

        if (editingRow) {
            editingRow.item.name     = name;
            editingRow.item.cat      = cat;
            editingRow.item.unit     = unit;
            editingRow.item.desc     = desc;
            editingRow.item.qty      = qty;
            editingRow.item.price    = price;
            editingRow.item.discount = discount;
        } else {
            const newItem = {
                id:       Date.now(),
                name:     name,
                cat:      cat,
                unit:     unit,
                desc:     desc,
                qty:      qty,
                price:    price,
                discount: discount,
            };
            data.unshift(newItem);
            filtered = data.slice();
            currentPage = 1;
        }

        overlay.classList.remove('open');
        renderTable();
        updateTotal();
    });
};

init('#app');
