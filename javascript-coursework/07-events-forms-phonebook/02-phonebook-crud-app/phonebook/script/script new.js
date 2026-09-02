'use strict'

const STORAGE_KEY = 'phoneBookContacts';

// 1) Получает данные из localStorage по ключу, если нет — возвращает пустой массив
const getStorage = (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
};

// 2) Получает ключ и объект, дописывает объект в массив и сохраняет в localStorage
const setStorage = (key, obj) => {
    const data = getStorage(key);
    data.push(obj);
    localStorage.setItem(key, JSON.stringify(data));
};

// 3) Получает номер телефона, удаляет контакт из localStorage
const removeStorage = (key, phone) => {
    const data = getStorage(key);
    const updated = data.filter(contact => contact.phone !== phone);
    localStorage.setItem(key, JSON.stringify(updated));
};

// Инициализация данных: берём из localStorage или используем дефолтные
const defaultData = [
    {
        name: 'Иван',
        surname: 'Петров',
        phone: '+79514545454',
    },
    {
        name: 'Игорь',
        surname: 'Семёнов',
        phone: '+79999999999',
    },
    {
        name: 'Семён',
        surname: 'Иванов',
        phone: '+79800252525',
    },
    {
        name: 'Мария',
        surname: 'Попова',
        phone: '+79876543210',
    },
];

// Если в localStorage ничего нет — записываем дефолтные данные
if (getStorage(STORAGE_KEY).length === 0) {
    defaultData.forEach(contact => setStorage(STORAGE_KEY, contact));
}

// Рабочий массив данных берём из localStorage
const data = getStorage(STORAGE_KEY);

{
    const addContactData = contact => {
        setStorage(STORAGE_KEY, contact); // сохраняем в localStorage
        data.push(contact);
        console.log('data: ', data);
    }

    const createContainer = () => {
        const container = document.createElement('div');
        container.classList.add('container');
        return container;
    }

    const createHeader = () => {
        const header = document.createElement('header');
        header.classList.add('header');

        const headerContainer = createContainer();
        header.append(headerContainer);
        header.headerContainer = headerContainer;

        return header;
    };

    const createLogo = title => {
        const h1 = document.createElement('h1');
        h1.classList.add('logo');
        h1.textContent = `Телефонный справочник. ${title}`;
        return h1;
    };

    const createMain = () => {
        const main = document.createElement('main');
        const mainContainer = createContainer();
        main.append(mainContainer);
        main.mainContainer = mainContainer;
        return main;
    };

    const createButtonsGroup = params => {
        const btnWrapper = document.createElement('div');
        btnWrapper.classList.add('btn-wrapper');

        const btns = params.map(({className, type, text}) => {
            const button = document.createElement('button');
            button.type = type;
            button.textContent = text;
            button.className = className;
            return button;
        });

        btnWrapper.append(...btns)

        return {
            btnWrapper,
            btns,
        };
    };

    const createTable = () => {
        const table = document.createElement('table');
        table.classList.add('table', 'table-striped');

        const thead = document.createElement('thead');
        thead.insertAdjacentHTML('beforeend', `
        <tr>
            <th class="delete">Удалить</th>
            <th data-sort="name">Имя</th>
            <th data-sort="surname">Фамилия</th>
            <th>Телефон</th>
            <th>Редакция</th>
        </tr>
        `);

        const tbody = document.createElement('tbody');

        table.append(thead, tbody);
        table.tbody = tbody;

        return table;
    };

    const createForm = () => {
        const overlay = document.createElement('div');
        overlay.classList.add('form-overlay');

        const form = document.createElement('form');
        form.classList.add('form');
        form.insertAdjacentHTML('beforeend', `
            <button class="close" type="button"></button>
            <h2 class="form-title">Добавить контакт</h2>
            <div class="form-group">
                <label class="form-label" for="name">Имя:</label>
                <input class="form-input" name="name" 
                id="name" type="text" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="name">Фамилия:</label>
                <input class="form-input" name="surname" 
                id="surname" type="text" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="name">Телефон:</label>
                <input class="form-input" name="phone" 
                id="phone" type="tel" required>
            </div>
        `);

        const buttonGroup = createButtonsGroup([
            {
                className: 'btn btn-primary mr-3',
                type: 'submit',
                text: 'Добавить',
            },
            {
                className: 'btn btn-danger',
                type: 'reset',
                text: 'Отмена',
            }
        ]);

        form.append(...buttonGroup.btns);
        overlay.append(form);

        return {
            overlay,
            form,
        };
    };

    const renederPhoneBook = (app, title) => {
        const header = createHeader();
        const logo = createLogo(title);
        const main = createMain();
        const buttonGroup = createButtonsGroup([
            {
                className: 'btn btn-primary mr-3 js-add',
                type: 'button',
                text: 'Добавить',
            },
            {
                className: 'btn btn-danger',
                type: 'button',
                text: 'Удалить',
            }
        ]);

        const table = createTable();
        const {form, overlay} = createForm();

        header.headerContainer.append(logo);
        main.mainContainer.append(buttonGroup.btnWrapper, table, overlay);
        app.append(header, main);

        return {
            btnDell: buttonGroup.btns[1],
            list: table.tbody,
            logo,
            btnAdd: buttonGroup.btns[0],
            formOverlay: overlay,
            form,
        };
    };

    const createRow = ({name: firstName, surname, phone}) => {
        const tr = document.createElement('tr')
        tr.classList.add('contact');

        const tdDel = document.createElement('td')
        tdDel.classList.add('delete')
        const buttonDel = document.createElement('button')
        buttonDel.classList.add('del-icon')
        tdDel.append(buttonDel)

        const tdchange = document.createElement('td');
        const btnEdit = document.createElement('button');
        btnEdit.className = 'btn btn-success btn-sm';
        btnEdit.textContent = 'Редактировать';
        tdchange.append(btnEdit);

        const tdName = document.createElement('td')
        tdName.textContent = firstName;

        const tdSurname = document.createElement('td')
        tdSurname.textContent = surname;

        const tdPhone = document.createElement('td')
        const phoneLink = document.createElement('a')
        phoneLink.href = `tel:${phone}`;
        phoneLink.textContent = phone;
        tr.phoneLink = phoneLink;
        tdPhone.append(phoneLink);

        tr.append(tdDel, tdName, tdSurname, tdPhone, tdchange)

        tr.btnEdit = btnEdit;
        tr.tdName = tdName;
        tr.tdSurname = tdSurname;

        return tr;
    };

    const renderContacts = (elem, data) => {
        const allRow = data.map(createRow);
        elem.append(...allRow);
        return allRow
    };

    const hoverRow = (allRow, logo) => {
        const text = logo.textContent
        allRow.forEach(contact => {
            contact.addEventListener('mouseenter', () => {
                logo.textContent = contact.phoneLink.textContent;
            });
            contact.addEventListener('mouseleave', () => {
                logo.textContent = text;
            });
        });
    };

    const modalControl = (btnAdd, formOverlay) => {

        const openModal = () => {
            formOverlay.classList.add('is-visible');
        }

        const closeModal = () => {
            formOverlay.classList.remove('is-visible');
        }

        btnAdd.addEventListener('click', openModal);

        formOverlay.addEventListener('click', e => {
            const target = e.target;
            if (target === formOverlay || target.closest('.close')) {
                formOverlay.classList.remove('is-visible');
            }
        });

        return {
            closeModal,
        }
    }

    const deleteControl = (btnDell, list) => {
        btnDell.addEventListener('click', () => {
            document.querySelectorAll('.delete').forEach(del => {
                del.classList.toggle('is-visible');
            })
        });

        list.addEventListener('click', e => {
            const target = e.target;
            if (target.closest('.del-icon')) {
                const row = target.closest('.contact');
                const phone = row.phoneLink.textContent;
                removeStorage(STORAGE_KEY, phone); // удаляем из localStorage
                row.remove();
            }
        });
    }

    const editControl = (form, list, formOverlay, closeModal) => {
        const formTitle = form.querySelector('.form-title');
        const submitBtn = form.querySelector('[type="submit"]');
        const nameInput = form.querySelector('#name');
        const surnameInput = form.querySelector('#surname');
        const phoneInput = form.querySelector('#phone');

        let editingRow = null;

        const attachEditBtn = (row) => {
            row.btnEdit.addEventListener('click', () => {
                editingRow = row;
                formTitle.textContent = 'Редактировать контакт';
                submitBtn.textContent = 'Сохранить';
                nameInput.value = row.tdName.textContent;
                surnameInput.value = row.tdSurname.textContent;
                phoneInput.value = row.phoneLink.textContent;
                formOverlay.classList.add('is-visible');
            });
        };

        Array.from(list.children).forEach(attachEditBtn);

        form.addEventListener('submit', e => {
            e.preventDefault();

            const name = nameInput.value.trim();
            const surname = surnameInput.value.trim();
            const phone = phoneInput.value.trim();

            if (!name || !surname || !phone) {
                alert('заполните все поля формы.');
                return;
            }

            if (editingRow) {
                const oldPhone = editingRow.phoneLink.textContent;

                editingRow.tdName.textContent = name;
                editingRow.tdSurname.textContent = surname;
                editingRow.phoneLink.href = `tel:${phone}`;
                editingRow.phoneLink.textContent = phone;

                // Обновляем localStorage: удаляем старый, добавляем новый
                removeStorage(STORAGE_KEY, oldPhone);
                setStorage(STORAGE_KEY, { name, surname, phone });

                const index = Array.from(list.children).indexOf(editingRow);
                if (index !== -1) {
                    data[index] = { name, surname, phone };
                }

                editingRow = null;
                formTitle.textContent = 'Добавить контакт';
                submitBtn.textContent = 'Добавить';
            } else {
                const newContact = { name, surname, phone };
                const newRow = createRow(newContact);

                const isDeleteViseble = document.querySelector('.delete.is-visible');
                if (isDeleteViseble) {
                    newRow.querySelector('.delete').classList.add('is-visible')
                }

                list.append(newRow);
                attachEditBtn(newRow);
                addContactData(newContact); // внутри вызывает setStorage
            }

            form.reset();
            closeModal();
        });

        return { attachEditBtn };
    };

    const sortControl = (list, logo) => {
        list.closest('table').addEventListener('click', e => {
            const th = e.target.closest('th[data-sort]');
            if (!th) return;

            const index = th.cellIndex;

            const rows = Array.from(list.children);
            rows.sort((a, b) => {
                const aText = a.children[index].textContent;
                const bText = b.children[index].textContent;

                if (aText > bText) return 1;
                if (aText < bText) return -1;
                return 0;
            });

            rows.forEach(row => list.append(row));
        });
    };

    const init = (selectorApp, title) => {
        const app = document.querySelector(selectorApp);

        const { list, logo, btnAdd, btnDell, formOverlay, form } = renederPhoneBook(app, title);

        // Данные берём из localStorage (уже загружены в переменную data вверху)
        const allRow = renderContacts(list, data);
        hoverRow(allRow, logo);

        const { closeModal } = modalControl(btnAdd, formOverlay);
        deleteControl(btnDell, list);
        const { attachEditBtn } = editControl(form, list, formOverlay, closeModal);
        sortControl(list, logo);
    };

    window.phoneBookInit = init;
}
