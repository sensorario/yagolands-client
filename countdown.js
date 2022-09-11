import { clock } from './modules/clock/clock.js';
import { emit } from './modules/eventi/eventi.js';

const updateCountDown = () => {
    if (--secondiAllaFine >= 0) {
        document.querySelector('.countdown').innerHTML = clock(secondiAllaFine);
    }
};

const checkVisibility = () => {
    if (secondiAllaFine <= 0) {
        document.querySelector('.countdown-wrapper').style.visibility = 'hidden';
        emit('coundown_completed');
    } else {
        document.querySelector('.countdown-wrapper').style.visibility = 'visible';
    }
};

const countdown = () => {
    updateCountDown();
    checkVisibility();
    setTimeout(countdown, 1000);
};

countdown();
