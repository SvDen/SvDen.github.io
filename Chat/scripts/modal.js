'use strict';

const showPrompt = function(text, callback, buttonID) {
    let container = document.getElementById('prompt-form-container'),
        form = container.children[0],
        message = form.children[0],
        inputText = form.elements['text'],
        firstInput = form.elements[0],
        lastInput = form.elements[form.elements.length - 1];

    const closeForm = function(value) {
        if (inputText.value == '' && value != null) {return false;} // submit ��� ������ ������ �� ��������
        callback(value);

        form.onsubmit = null; // �������� ��� �����������
        form.elements['cancel'].onclick = null;
        form.onkeydown = null;

        container.style.display = ''; // �������� ��������� � ��������� �����
        inputText.value = ''; // � ������� ����� (����� ���-�� ������ � ����� �������?)
        return false;
    }

    const show = function () {
        message.innerHTML = text;
        container.style.display = 'block';
        inputText.focus();

        // ����������� ��������� ������ (� �� �������) ������� ��� ����, �����
        // �� ����� ���� ������� ����� ������� ������, � ���� ����� ����� ����
        // ������������ �������� ������� caller'���
        form.onsubmit = () => closeForm(inputText.value);
        form.elements['cancel'].onclick = () => closeForm(null);
        form.onkeydown = (e) => {
            if (e.which == 27) {closeForm(null);} // ���������� �� Esc. �������� �������� ������ ����
            // ����� ������ ����� �������� �� ������� �����. ����� ����� ���������, �� � �� ������, ��� ��� ���������
            if (e.target == firstInput && e.which == 9 && e.shiftKey) { // ��������� ������������ ����� + Shift
                lastInput.focus();
                e.preventDefault();
            }
            if (e.target == lastInput && e.which == 9 && !e.shiftKey) { // ���������� ��� Shift'a
                firstInput.focus();
                e.preventDefault();
            }
        }
    }
    document.getElementById(buttonID).addEventListener('click', show);
}