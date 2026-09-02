'use strict';

const data = [
    { id: 1, name: 'Навигационная система', cat: 'Техника для дома', unit: 'шт', desc: '', qty: 5, price: 100, discount: 0, pic: '/img/kot.jpg' },
    { id: 2, name: 'Настольная игра ', cat: 'Настольные игры', unit: 'шт', desc: '', qty: 12, price: 14, discount: 0, pic: '' },
    { id: 3, name: 'Беспроводные наушники Sony', cat: 'Электроника', unit: 'шт', desc: '', qty: 3, price: 80, discount: 0, pic: '/img/kot.jpg' },
    { id: 4, name: 'Книга "Преступление и наказание"', cat: 'Книги', unit: 'шт', desc: '', qty: 10, price: 25, discount: 0, pic: '' },
];
let nextId = 5;

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

    const addBtn = document.createElement('button');
    addBtn.classList.add('add-btn');
    addBtn.type = 'button';
    addBtn.textContent = 'ДОБАВИТЬ ТОВАР';

    toolbar.append(addBtn);
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
            <th>НАИМЕНОВАНИЕ</th>
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

    return tableWrap;
};

const createOverlay = () => {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');

    const modal = document.createElement('div');
    modal.classList.add('modal');

    const modalHead = document.createElement('div');
    modalHead.classList.add('modal-head');

    const headLeft = document.createElement('div');

    const modalTitle = document.createElement('div');
    modalTitle.classList.add('modal-title');
    modalTitle.textContent = 'ДОБАВИТЬ ТОВАР';

    headLeft.append(modalTitle);

    const xBtn = document.createElement('button');
    xBtn.classList.add('x-btn');
    xBtn.type = 'button';
    xBtn.textContent = 'x';

    modalHead.append(headLeft, xBtn);

    const divider = document.createElement('div');
    divider.classList.add('modal-divider');

    const formInner = document.createElement('div');
    formInner.classList.add('form-inner');

    const formLayout = document.createElement('form');
    formLayout.classList.add('form-layout');

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

    const discountField = document.createElement('div');
    discountField.classList.add('discount-field');
    discountField.innerHTML = '<label>ДИСКОНТ</label>';
    const discountRow = document.createElement('div');
    discountRow.classList.add('discount-row');
    const checkbox = document.createElement('div');
    checkbox.classList.add('checkbox');
    checkbox.innerHTML = '<img src="./img/test">';
    const inputDiscount = document.createElement('input');
    inputDiscount.type = 'number';
    inputDiscount.min = '1';
    inputDiscount.max = '100';
    inputDiscount.placeholder = '1-100%';
    inputDiscount.disabled = true;
    discountRow.append(checkbox, inputDiscount);
    discountField.append(discountRow);

    colLeft.append(fieldName, fieldCat, fieldUnit, discountField);

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

    colRight.append(fieldDesc, fieldQty, fieldPrice);

    formLayout.append(colLeft, colRight);
    formInner.append(formLayout);

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

    overlay.xBtn = xBtn;
    overlay.submitBtn = submitBtn;
    overlay.modalTitle = modalTitle;
    overlay.formLayout = formLayout;
    overlay.checkbox = checkbox;
    overlay.inputDiscount = inputDiscount;
    overlay.inputs = { inputName, inputCat, inputUnit, inputDesc, inputQty, inputPrice };

    return overlay;
};

const createRow = (item) => {
    const tr = document.createElement('tr');

    const total = (item.qty * item.price).toFixed(2);

    tr.dataset.pic = item.pic || '';

    tr.innerHTML = `
        <td>${item.id}</td>
        <td>${item.name}</td>
        <td>${item.cat}</td>
        <td>${item.unit}</td>
        <td>${item.qty}</td>
        <td>$${parseFloat(item.price).toFixed(2)}</td>
        <td>$${total}</td>
    `;


    const tdActions = document.createElement('td');
    tdActions.classList.add('td-actions');

    const imgBtn = document.createElement('button');
    imgBtn.type = 'button';

    if (item.pic) {
        imgBtn.classList.add('icon-btn', 'img-btn--has-pic');
        imgBtn.innerHTML = '<img src="/icons/image.svg">';
        imgBtn.addEventListener('click', () => {
            const w = 600;
            const h = 600;
            const left = Math.round((screen.width - w) / 2);
            const top = Math.round((screen.height - h) / 2);
            window.open(item.pic, '_blank', 'width=' + w + ',height=' + h + ',left=' + left + ',top=' + top);
        });
    } else {
        imgBtn.classList.add('icon-btn', 'img-btn--no-pic');
        imgBtn.innerHTML = '<img src="/icons/carbon_no-image.svg">';
    }

    const delBtn = document.createElement('button');
    delBtn.classList.add('icon-btn', 'del-icon-btn');
    delBtn.type = 'button';
    delBtn.innerHTML='<img src="/icons/delete.svg">';

    tdActions.append(imgBtn, delBtn);
    tr.append(tdActions);

    tr.delBtn = delBtn;
    tr.itemId = item.id;

    return tr;
};

const init = (selector) => {
    const app = document.querySelector(selector);

    const page = createPage();
    const topBar = createTopBar();
    const card = document.createElement('div');
    card.classList.add('card');
    const toolbar = createToolbar();
    const tableWrap = createTable();
    const overlay = createOverlay();

    card.append(toolbar, tableWrap);
    page.append(topBar, card, overlay);
    app.append(page);

    const tbody = tableWrap.tbody;
    const topTotal = document.getElementById('top-total');
    const modalTotalEl = document.getElementById('modal-total');

    const calculateTotals = () => {
        const sum = data.reduce((acc, item) => acc + item.qty * item.price, 0);
        topTotal.textContent = '$' + sum.toFixed(2);
    };

    const updateModalTotal = () => {
        const qty = parseFloat(overlay.inputs.inputQty.value) || 0;
        const price = parseFloat(overlay.inputs.inputPrice.value) || 0;
        let discount = 0;
        if (overlay.checkbox.classList.contains('on')) {
            const d = parseFloat(overlay.inputDiscount.value);
            if (!isNaN(d) && d >= 1 && d <= 100) discount = d;
        }
        const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;
        modalTotalEl.textContent = '$' + (qty * finalPrice).toFixed(2);
    };

    const renderEmpty = () => {
        tbody.innerHTML = '';
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.classList.add('empty-td');
        td.colSpan = 8;
        td.textContent = 'Товаров нет — нажмите «ДОБАВИТЬ ТОВАР»';
        tr.append(td);
        tbody.append(tr);
    };

    const renderRow = (item) => {
        const tr = createRow(item);

        tr.delBtn.addEventListener('click', () => {
            const idx = data.findIndex(d => d.id === item.id);
            if (idx !== -1) data.splice(idx, 1);
            if (data.length === 0) {
                renderEmpty();
            } else {
                tr.remove();
            }
            calculateTotals();
        });

        return tr;
    };

    data.forEach(item => {
        const tr = renderRow(item);
        tr.dataset.id = item.id;
        tbody.append(tr);
    });
    calculateTotals();



    const openAddModal = () => {
        overlay.modalTitle.textContent = 'ДОБАВИТЬ ТОВАР';
        overlay.submitBtn.textContent = 'ДОБАВИТЬ ТОВАР';
        overlay.formLayout.reset();
        overlay.checkbox.classList.remove('on');
        overlay.inputDiscount.disabled = true;
        overlay.inputDiscount.value = '';
        updateModalTotal();
        overlay.classList.add('open');
    };

    const closeModal = () => {
        overlay.classList.remove('open');
    };

    toolbar.addBtn.addEventListener('click', openAddModal);
    overlay.xBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    overlay.checkbox.addEventListener('click', () => {
        overlay.checkbox.classList.toggle('on');
        if (overlay.checkbox.classList.contains('on')) {
            overlay.inputDiscount.disabled = false;
        } else {
            overlay.inputDiscount.value = '';
            overlay.inputDiscount.disabled = true;
        }
        updateModalTotal();
    });

    overlay.inputs.inputQty.addEventListener('blur', updateModalTotal);
    overlay.inputs.inputPrice.addEventListener('blur', updateModalTotal);
    overlay.inputDiscount.addEventListener('blur', updateModalTotal);

    Object.values(overlay.inputs).forEach(input => {
        input.addEventListener('input', () => input.classList.remove('error'));
    });
    overlay.inputDiscount.addEventListener('input', () => overlay.inputDiscount.classList.remove('error'));

    overlay.submitBtn.addEventListener('click', () => {
        const name = overlay.inputs.inputName.value.trim();
        const cat = overlay.inputs.inputCat.value.trim();
        const unit = overlay.inputs.inputUnit.value.trim();
        const desc = overlay.inputs.inputDesc.value.trim();
        const qty = parseFloat(overlay.inputs.inputQty.value);
        const price = parseFloat(overlay.inputs.inputPrice.value);

        let hasError = false;

        const setError = (input, show) => {
            input.classList.toggle('error', show);
        };

        setError(overlay.inputs.inputName, !name);
        if (!name) hasError = true;

        setError(overlay.inputs.inputCat, !cat);
        if (!cat) hasError = true;

        setError(overlay.inputs.inputUnit, !unit);
        if (!unit) hasError = true;

        setError(overlay.inputs.inputQty, isNaN(qty) || overlay.inputs.inputQty.value === '');
        if (isNaN(qty) || overlay.inputs.inputQty.value === '') hasError = true;

        setError(overlay.inputs.inputPrice, isNaN(price) || overlay.inputs.inputPrice.value === '');
        if (isNaN(price) || overlay.inputs.inputPrice.value === '') hasError = true;

        let discount = 0;
        if (overlay.checkbox.classList.contains('on')) {
            discount = parseFloat(overlay.inputDiscount.value);
            if (isNaN(discount) || discount < 1 || discount > 100) {
                overlay.inputDiscount.classList.add('error');
                hasError = true;
            } else {
                overlay.inputDiscount.classList.remove('error');
            }
        } else {
            overlay.inputDiscount.classList.remove('error');
        }

        if (hasError) return;

        const finalPrice = discount > 0 ? +(price * (1 - discount / 100)).toFixed(2) : price;

        const item = { id: nextId++, name, cat, unit, desc, qty, price: finalPrice, discount };
        data.push(item);

        if (tbody.querySelector('.empty-td')) tbody.innerHTML = '';

        const tr = renderRow(item);
        tr.dataset.id = item.id;
        tbody.append(tr);

        calculateTotals();
        overlay.formLayout.reset();
        overlay.checkbox.classList.remove('on');
        overlay.inputDiscount.disabled = true;
        closeModal();
    });
};

init('#app');
