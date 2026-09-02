'use strict';

// ── STORAGE ──────────────────────────────────────────
const Storage = {
  get(username) {
    try { return JSON.parse(localStorage.getItem(username)) || []; }
    catch { return []; }
  },
  save(username, items) {
    localStorage.setItem(username, JSON.stringify(items));
  }
};

// ── ELEMENTS ─────────────────────────────────────────
const createAuthOverlay = () => {
  const overlay = document.createElement('div');
  overlay.classList.add('overlay');

  const modal = document.createElement('div');
  modal.classList.add('modal');

  modal.innerHTML = `
    <div class="modal-logo">TODO</div>
    <p class="modal-sub">Представьтесь, чтобы войти в своё рабочее пространство</p>
    <label for="auth-input">Ваше имя</label>
    <input id="auth-input" type="text" placeholder="например, Алексей" autocomplete="off" />
    <button class="modal-btn" id="auth-btn">Войти →</button>
  `;

  overlay.append(modal);
  return overlay;
};

const createHeader = (username) => {
  const header = document.createElement('header');
  header.classList.add('app-header');
  header.innerHTML = `
    <div class="app-logo">TODO</div>
    <div class="greeting">Привет, <span>${username}</span> 👋</div>
  `;
  return header;
};

const createInputRow = () => {
  const row = document.createElement('div');
  row.classList.add('input-row');

  const input = document.createElement('input');
  input.type = 'text';
  input.classList.add('task-input');
  input.placeholder = 'Новая задача…';

  const select = document.createElement('select');
  select.classList.add('priority-select');
  select.innerHTML = `
    <option value="normal">● Обычная</option>
    <option value="important">● Важная</option>
    <option value="urgent">● Срочная</option>
  `;

  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.classList.add('save-btn');
  saveBtn.textContent = 'Сохранить';
  saveBtn.disabled = true;

  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.classList.add('clear-btn');
  clearBtn.textContent = 'Очистить';

  row.append(input, select, saveBtn, clearBtn);
  row.input = input;
  row.select = select;
  row.saveBtn = saveBtn;
  row.clearBtn = clearBtn;

  return row;
};

const createTableWrap = () => {
  const wrap = document.createElement('div');
  wrap.classList.add('table-wrapper');

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>#</th>
      <th>Задача</th>
      <th>Статус</th>
      <th>Действия</th>
    </tr>
  `;
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);
  wrap.append(table);
  wrap.tbody = tbody;

  return wrap;
};

const createEmptyRow = () => {
  const tr = document.createElement('tr');
  tr.classList.add('empty-row');
  tr.innerHTML = `<td colspan="4">Задач нет — добавьте первую ↑</td>`;
  return tr;
};

const createRow = (item, index) => {
  const tr = document.createElement('tr');
  tr.dataset.id = item.id;
  tr.classList.add('prio-' + (item.priority || 'normal'));

  const tdNum = document.createElement('td');
  tdNum.classList.add('num');
  tdNum.textContent = index + 1;

  const tdTask = document.createElement('td');
  tdTask.classList.add('task-text');
  tdTask.contentEditable = 'false';
  tdTask.textContent = item.text;
  if (item.done) tdTask.classList.add('done');

  const tdStatus = document.createElement('td');
  tdStatus.classList.add('status');
  const badge = document.createElement('span');
  badge.classList.add('badge', item.done ? 'done-badge' : 'in-progress');
  badge.textContent = item.done ? 'Выполнена' : 'В процессе';
  tdStatus.append(badge);

  const tdActions = document.createElement('td');
  tdActions.classList.add('actions');
  const actWrap = document.createElement('div');
  actWrap.classList.add('actions-wrap');

  const doneBtn = document.createElement('button');
  doneBtn.classList.add('btn-act', 'btn-done');
  doneBtn.type = 'button';
  doneBtn.textContent = item.done ? 'Отменить' : 'Завершить';

  const editBtn = document.createElement('button');
  editBtn.classList.add('btn-act', 'btn-edit');
  editBtn.type = 'button';
  editBtn.textContent = 'Ред.';

  const delBtn = document.createElement('button');
  delBtn.classList.add('btn-act', 'btn-del');
  delBtn.type = 'button';
  delBtn.textContent = 'Удалить';

  actWrap.append(doneBtn, editBtn, delBtn);
  tdActions.append(actWrap);
  tr.append(tdNum, tdTask, tdStatus, tdActions);

  tr.tdNum   = tdNum;
  tr.tdTask  = tdTask;
  tr.doneBtn = doneBtn;
  tr.editBtn = editBtn;
  tr.delBtn  = delBtn;

  return tr;
};

// ── RENDER HELPERS ───────────────────────────────────
const reindex = (tbody) => {
  const rows = tbody.querySelectorAll('tr[data-id]');
  rows.forEach(function(tr, i) { tr.tdNum.textContent = i + 1; });
};

const renderEmptyIfNeeded = (tbody) => {
  if (!tbody.querySelector('tr[data-id]')) {
    if (!tbody.querySelector('.empty-row')) tbody.append(createEmptyRow());
  } else {
    const empty = tbody.querySelector('.empty-row');
    if (empty) empty.remove();
  }
};

// ── ROW EVENT BINDING ────────────────────────────────
const bindRow = (tr, item, tbody, username, items) => {
  // Завершить / Отменить
  tr.doneBtn.addEventListener('click', function() {
    item.done = !item.done;

    const badge = tr.querySelector('.badge');
    badge.className = 'badge ' + (item.done ? 'done-badge' : 'in-progress');
    badge.textContent = item.done ? 'Выполнена' : 'В процессе';

    tr.tdTask.classList.toggle('done', item.done);
    tr.doneBtn.textContent = item.done ? 'Отменить' : 'Завершить';

    Storage.save(username, items);
  });

  // Удалить
  tr.delBtn.addEventListener('click', function() {
    if (!confirm('Удалить задачу «' + item.text + '»?')) return;
    var idx = items.findIndex(function(i) { return i.id === item.id; });
    if (idx !== -1) items.splice(idx, 1);
    tr.remove();
    reindex(tbody);
    renderEmptyIfNeeded(tbody);
    Storage.save(username, items);
  });

  // Редактировать
  tr.editBtn.addEventListener('click', function() {
    var isEditing = tr.tdTask.contentEditable === 'true';

    if (!isEditing) {
      tr.tdTask.contentEditable = 'true';
      tr.tdTask.focus();

      var range = document.createRange();
      var sel = window.getSelection();
      range.selectNodeContents(tr.tdTask);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);

      tr.editBtn.textContent = 'Готово';
      tr.editBtn.style.background = 'rgba(232,255,71,.22)';
      tr.editBtn.style.color = 'var(--accent)';
    } else {
      var newText = tr.tdTask.textContent.trim();
      if (newText) {
        item.text = newText;
        tr.tdTask.textContent = newText;
      } else {
        tr.tdTask.textContent = item.text;
      }
      tr.tdTask.contentEditable = 'false';
      tr.editBtn.textContent = 'Ред.';
      tr.editBtn.style.background = '';
      tr.editBtn.style.color = '';
      Storage.save(username, items);
    }
  });
};

const renderAll = (tbody, items, username) => {
  tbody.innerHTML = '';
  if (items.length === 0) { tbody.append(createEmptyRow()); return; }
  items.forEach(function(item, idx) {
    var tr = createRow(item, idx);
    bindRow(tr, item, tbody, username, items);
    tbody.append(tr);
  });
};

const appendRow = (tbody, item, username, items) => {
  var empty = tbody.querySelector('.empty-row');
  if (empty) empty.remove();
  var idx = tbody.querySelectorAll('tr[data-id]').length;
  var tr = createRow(item, idx);
  bindRow(tr, item, tbody, username, items);
  tbody.append(tr);
};

// ── AUTH ─────────────────────────────────────────────
const initAuth = () => {
  var overlay = createAuthOverlay();
  document.body.append(overlay);
  requestAnimationFrame(function() { overlay.classList.add('open'); });

  var authInput = overlay.querySelector('#auth-input');
  var authBtn   = overlay.querySelector('#auth-btn');

  var startApp = function() {
    var name = authInput.value.trim();
    if (!name) return;
    overlay.classList.remove('open');
    setTimeout(function() { overlay.remove(); }, 300);
    initApp(name);
  };

  authBtn.addEventListener('click', startApp);
  authInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') startApp();
  });
};

// ── APP ───────────────────────────────────────────────
const initApp = (username) => {
  var app = document.getElementById('app');
  var items = Storage.get(username);

  app.append(createHeader(username));

  var inputRow = createInputRow();
  app.append(inputRow);
  var input   = inputRow.input;
  var select  = inputRow.select;
  var saveBtn = inputRow.saveBtn;
  var clearBtn = inputRow.clearBtn;

  var tableWrap = createTableWrap();
  app.append(tableWrap);
  var tbody = tableWrap.tbody;

  renderAll(tbody, items, username);

  // input → enable/disable save button
  input.addEventListener('input', function() {
    saveBtn.disabled = !input.value.trim();
  });

  var addTask = function() {
    var text = input.value.trim();
    if (!text) return;

    var item = {
      id: Math.random().toString().substring(2, 18),
      text: text,
      priority: select.value,
      done: false
    };

    items.push(item);
    Storage.save(username, items);
    appendRow(tbody, item, username, items);

    input.value = '';
    saveBtn.disabled = true;
  };

  saveBtn.addEventListener('click', addTask);
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') addTask();
  });

  clearBtn.addEventListener('click', function() {
    input.value = '';
    saveBtn.disabled = true;
    input.focus();
  });
};

// ── START ─────────────────────────────────────────────
initAuth();
