'use strict';

const container = document.querySelector('.container');

const session = document.querySelector('.session-storage');
const local = document.querySelector('.local-storage');

const resetSession = document.querySelector('.reset-session');
const resetLocal = document.querySelector('.reset-local');



container.addEventListener('change', e => {
    const target = e.target;
    const parent = target.closest('.storage');
    parent.style.backgroundColor = parent.color.value;
    parent.style.fontSize = parent['font-size'].value + 'px';
    if (parent === session) {
        console.log('session');
        sessionStorage.setItem(target.name, target.value);
    }
    if (parent === local) {
        console.log('local');
        localStorage.setItem(target.name, target.value);
    }
})

const init = () => {
    session['font-size'].value = sessionStorage.getItem('font-size') || session['font-size'].value;
    session.color.value = sessionStorage.getItem('color') || session.color.value;

    local['font-size'].value = localStorage.getItem('font-size') || local['font-size'].value;
    local.color.value = localStorage.getItem('color') || local.color.value;

    session.style.backgroundColor = session.color.value;
    session.style.fontSize = session['font-size'].value + 'px';

    local.style.backgroundColor = local.color.value;
    local.style.fontSize = local['font-size'].value + 'px';
}

resetSession.addEventListener('click', () =>{
    sessionStorage.clear();
    session.reset()
    init();
});
resetLocal.addEventListener('click', () =>{
    localStorage.clear();
    local.reset();
    init();
});

// localStorage.setItem('test1',true)
// localStorage.setItem('test2',false)
// localStorage.setItem('test3',123)
// localStorage.setItem('test4',JSON.stringify([1,2,3]))
// localStorage.setItem('test5',JSON.stringify({a:1,b:2}))


init();