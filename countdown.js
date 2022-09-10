import clock from './modules/clock/clock.js';
import eventi from './modules/eventi/eventi.js';

const events = eventi();

function updateCountDown() {
    if (--secondiAllaFine >= 0) {
        document.querySelector('.countdown').innerHTML = clock().clock(secondiAllaFine);
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
