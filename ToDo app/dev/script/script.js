'use strict';

function ToDoList(options) {
    const id = options.id,
        elem = document.getElementById(id),
        list = document.getElementById('todo-list-group'),
        form = elem.getElementsByTagName('form')[0],
        addButton = document.getElementById('todo-submit'),
        input = document.getElementById('todo-input'),
        important = document.getElementById('todo-important'),
        filters = document.getElementById('todo-filters');

    let local,
        storage = localStorage,
        editingNow = false;


    /*** STORAGE ***/

    loadFromLocalStorage();

    function loadFromLocalStorage() {
        let parsed;

        try {
            parsed = JSON.parse(storage.getItem('todo-list'));
        } catch (e) {
            parsed = undefined;
            console.log(`Error in localStorage file: ${e.message}`);
        }
        local = parsed || {};

        // update does 2 tasks:
        // a) refresh the LS
        // б) check the filter visibility
        updateLocalStorage();

        for (let key in local) {
            addTask(key, local[key].task, local[key].important, local[key].completed)
        }
    }

    function updateLocalStorage() {
        storage.setItem('todo-list',JSON.stringify(local));

        // change filter visibility
        if (Object.keys(local).length == 0) {
            filters.classList.add('hidden');
        } else {
            filters.classList.remove('hidden');
        }
    }


    /*** WORKING WITH TASKS ***/

    function deleteTask(target) {
        let li = target.closest('li'),
            id = li.getAttribute('data-id');

        li.remove();
        delete local[id];
        updateLocalStorage();
    }

    function editTask(target) {
        if (editingNow) return; // check if some field is editing now
        editingNow = true;
        target.classList.add('hidden');

        let li = target.closest('li'),
            id = li.getAttribute('data-id'),
            input = document.createElement('div');

        input.innerHTML = '<input type="text" class="todo-list-edit form-control">';
        input = input.firstChild;
        input.value = target.textContent;
        li.appendChild(input);
        input.focus();

        function stopEditingMouse(e) {
            if (e.target == input) return;
            target.textContent = input.value;
            local[id].task = target.textContent;

            document.removeEventListener('click', stopEditingMouse);
            input.remove();
            editingNow = false;
            target.classList.remove('hidden');
            updateLocalStorage();
        }

        function stopEditingKey(e) {
            let key = e.which;

            if (key == 13) { // 'enter'
                target.textContent = input.value;
                local[id].task = target.textContent;
            }
            else if (key == 27) { // 'esc'
                // do nothing here :-)
            } else {
                return;
            }

            document.removeEventListener('click', stopEditingMouse);
            input.remove();
            editingNow = false;
            target.classList.remove('hidden');
            updateLocalStorage();
        }


        event.stopImmediatePropagation();
        document.addEventListener('click', stopEditingMouse);
        document.addEventListener('keydown', stopEditingKey);
    }

    function toggleImportant(target) {
        let li = target.closest('li'),
            id = li.getAttribute('data-id');

        target.classList.toggle('label-danger');
        target.classList.toggle('label-default');

        local[id].important = !local[id].important;
        updateLocalStorage();
    }

    function completeTask(target) {
        let li = target.closest('li'),
            id = li.getAttribute('data-id');

        li.classList.toggle('completed');
        local[id].completed = !local[id].completed;
        updateLocalStorage();
    }

    list.addEventListener('click', function(e) {
        let target = e.target;
        if (target.classList.contains('todo-item-close')) deleteTask(target);
        if (target.classList.contains('todo-item-label')) toggleImportant(target);
        // we need to catch the INPUT exactly
        if (target.classList.contains('todo-item-icon')) completeTask(target.parentElement.getElementsByTagName('input')[0]);
    });

    list.addEventListener('dblclick', function(e) {
        let target = e.target;
        if (target.classList.contains('todo-item-text')) editTask(target);
    })


    /*** ADDING NEW TASKS ***/

    function newTask(task, important, completed) {
        // create a new local storage object
        let id = Math.random();

        let obj = {
            task,
            important,
            completed
        };
        local[id] = obj;

        addTask(id, task, important, completed);

        input.focus();
        updateLocalStorage();
    }

    function addTask(id, string, important, completed) {
        let task = document.createElement('li');
        task.classList.add('list-group-item', 'todo-item');
        task.setAttribute('data-id', id);

        let danger;
        (important === true) ? danger = 'label-danger' : danger = 'label-default';

        let html = `<label class="complete-container">
                            <input type="checkbox" class="complete">
                            <span class="todo-item-icon"></span>
                        </label>
                        <span class="todo-item-label label ${danger}">!</span>
                        <span class="todo-item-text">${string}</span>
                        <span class="todo-item-close text-danger pull-right">&#10006;</span>`

        if (completed) task.classList.add('completed');
        task.innerHTML = html;
        list.appendChild(task);
    }

    addButton.addEventListener('click', function(e) {
        let text = input.value;
        if (text == '') return false;
        newTask(text, important.checked, false);
        input.value = '';
        important.checked = false;
        e.preventDefault();
    });


    /*** FILTERS ***/

    function clearList() {
        let li = list.getElementsByTagName('li');
        Array.from(li).forEach(elem => elem.remove());
    }

    filters.addEventListener('click', function(e) {
        let target = e.target;
        if (!target.classList.contains('label')) return;

        // changing classes
        let filterElements = filters.getElementsByTagName('span');
        Array.from(filterElements).forEach(elem => elem.classList.remove('active'));
        target.classList.add('active');

        clearList();

        if (target.classList.contains('todo-all')) {
            for (let key in local) {
                addTask(key, local[key].task, local[key].important, local[key].completed)
            }
            return;
        }

        if (target.classList.contains('todo-active')) {
            for (let key in local) {
                if (!local[key].completed) addTask(key, local[key].task, local[key].important, local[key].completed)
            }
            return;
        }

        if (target.classList.contains('todo-completed')) {
            for (let key in local) {
                if (local[key].completed) addTask(key, local[key].task, local[key].important, local[key].completed)
            }
            return;
        }

        if (target.classList.contains('todo-important')) {
            for (let key in local) {
                if (local[key].important) addTask(key, local[key].task, local[key].important, local[key].completed)
            }
            return;
        }
    });


    /*** DRAG&DROP ***/

    let curCoords,
        startCoords,
        draggingElement,
        curTarget,
        curTargetEquator; // horizontal middle line of the event object (target)

    function changeElements(dragging, target, direction) {
        if (direction == 'down') {
            target.parentElement.insertBefore(dragging, target.nextSibling);
        } else {
            target.parentElement.insertBefore(dragging, target);
        }
        startCoords.y = curCoords.y;

        let targetID = target.getAttribute('data-id'),
            draggingID = dragging.getAttribute('data-id'),
            temp;

        // change the object's data ...
        temp = local[targetID];
        local[targetID] = local[draggingID];
        local[draggingID] = temp;

        // ... and ID's
        dragging.setAttribute('data-id', targetID);
        target.setAttribute('data-id', draggingID);

        updateLocalStorage();
    }

    function dragMove(e) {

        curCoords = {
            y: e.pageY
        };
        // if there was miss click => break the function
        if (Math.abs(startCoords.y - curCoords.y) < 10) return;

        draggingElement.classList.add('todo-element-dragging');
        document.body.classList.add('todo-dragging');

        // if mouse cursor went out of obj => break the function
        if (!e.target.closest('li')) return;

        // if mouse cursor is still on the object were previously calculated => break the function
        if (e.target.closest('li') !== curTarget) {
            curTarget = e.target.closest('li');
            curTargetEquator = curTarget.getBoundingClientRect().top + window.pageYOffset + curTarget.offsetHeight / 2;
        }

        // if elements are match => break the function
        if (draggingElement == curTarget) return;

        // if on top ... & bottom
        if (startCoords.y < curCoords.y && curCoords.y > curTargetEquator) {
            changeElements(draggingElement, curTarget, 'down');
        } else if (startCoords.y > curCoords.y && curCoords.y < curTargetEquator) {
            changeElements(draggingElement, curTarget, 'up');
        }
    }

    function dragEnd() {
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('mouseup', dragEnd);
        draggingElement.classList.remove('todo-element-dragging');
        document.body.classList.remove('todo-dragging');
    }

    list.addEventListener('mousedown', function (e) {
        curTarget = draggingElement = e.target.closest('li');
        // continue if: click on LI, left button, nothing is editing now
        if (draggingElement.closest('li').tagName !== 'LI' || e.which !== 1 || draggingElement.closest('ul').getElementsByClassName('todo-list-edit')[0]) return;

        startCoords = {
            y: e.pageY
        };

        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);

    });

    /*** OTHERS ***/

    // disable elements selection (except input elements)
    elem.addEventListener('mousedown', function(e) {
        if (e.target.closest('input')) return;
        e.preventDefault();
    })
}

let list = new ToDoList({
    id: 'todo-list'
});