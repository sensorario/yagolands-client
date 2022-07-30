import clock from './modules/clock.mjs';

function updateCountDown() {
    const seconds = --secondiAllaFine;
    if (secondiAllaFine >= 0) {
        document.querySelector('.countdown').innerHTML = clock(secondiAllaFine);
    }
}

function showButtons() {
    let buttons = document.querySelectorAll('[data-button="builder"]');
    buttons.forEach(button => (button.style.visibility = 'visible'));
}

function checkVisibility() {
    if (secondiAllaFine <= 0) {
        document.querySelector('.countdown-wrapper').style.visibility = 'hidden';
        if (queueOfStuff.length > 0) {
            for (let qof in queueOfStuff) {
                let fun = queueOfStuff.pop();
                fun();
            }
        }
        showButtons();
    } else {
        document.querySelector('.countdown-wrapper').style.visibility = 'visible';
    }
}

function countdown() {
    updateCountDown();
    checkVisibility();
    setTimeout(() => countdown(), 1000);
}

countdown();
