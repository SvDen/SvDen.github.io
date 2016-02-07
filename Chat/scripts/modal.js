'use strict';

const showPrompt = function(text, callback, buttonID) {
    let container = document.getElementById('prompt-form-container'),
        form = container.children[0],
        message = form.children[0],
        inputText = form.elements['text'],
        firstInput = form.elements[0],
        lastInput = form.elements[form.elements.length - 1];

    const closeForm = function(value) {
        if (inputText.value == '' && value != null) {return false;} // submit при пустой строке не работает
        callback(value);

        form.onsubmit = null; // обнуляем все обработчики
        form.elements['cancel'].onclick = null;
        form.onkeydown = null;

        container.style.display = ''; // скрываем контейнер с модальным окном
        inputText.value = ''; // и очищаем форму (вдруг кто-то другой её потом вызовет?)
        return false;
    }

    const show = function () {
        message.innerHTML = text;
        container.style.display = 'block';
        inputText.focus();

        // обработчики добавлены внутри (а не снаружи) функции для того, чтобы
        // их можно было снимать после каждого вызова, а саму форму можно было
        // использовать повторно разными caller'ами
        form.onsubmit = () => closeForm(inputText.value);
        form.elements['cancel'].onclick = () => closeForm(null);
        form.onkeydown = (e) => {
            if (e.which == 27) {closeForm(null);} // обработчик на Esc. Перестаёт работать только если
            // фокус кликом мышки уводится за пределы формы. Можно легко исправить, но я не уверен, что это актуально
            if (e.target == firstInput && e.which == 9 && e.shiftKey) { // обработка переключения табом + Shift
                lastInput.focus();
                e.preventDefault();
            }
            if (e.target == lastInput && e.which == 9 && !e.shiftKey) { // аналогично без Shift'a
                firstInput.focus();
                e.preventDefault();
            }
        }
    }
    document.getElementById(buttonID).addEventListener('click', show);
}