import clock from './modules/clock.mjs';
import eventi from './modules/eventi/eventi.js';

const events = eventi();

function updateCountDown() {
    const seconds = --secondiAllaFine;
    if (secondiAllaFine >= 0) {
        document.querySelector('.countdown').innerHTML = clock(secondiAllaFine);
    }
}

function checkVisibility() {
    if (secondiAllaFine <= 0) {
        document.querySelector('.countdown-wrapper').style.visibility = 'hidden';
        events.emit('coundown_completed');
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
