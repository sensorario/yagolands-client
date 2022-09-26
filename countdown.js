import { clock } from './modules/clock/clock.js';
import { emit } from './modules/eventi/eventi.js';

let secondiAllaFine = 0;

const updateOrario = () => {
    const dto = {
        now: Date.now(),
        ofl: new Date(orarioFineLavori).getTime()
    };
    dto.diff = dto.ofl - dto.now;
    dto.secondiAllaFine = dto.diff / 1000;
    secondiAllaFine = dto.secondiAllaFine;
};

const updateCountDown = () => {
    if (--secondiAllaFine >= 0) {
        document.querySelector('.countdown').textContent = clock(secondiAllaFine);
    }
};

const countdownWrapper = document.querySelector('.countdown-wrapper');
const checkVisibility = () => {
    if (secondiAllaFine <= 0) {
        countdownWrapper.style.visibility = 'hidden';
        emit('coundown_completed');
    } else {
        countdownWrapper.style.visibility = 'visible';
    }
};

const countdown = () => {
    updateOrario();
    updateCountDown();
    checkVisibility();
    setTimeout(countdown, 1000);
};

// countdown();
