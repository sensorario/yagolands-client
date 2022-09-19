import { clock } from './modules/clock/clock.js';
import { on, emit } from './modules/eventi/eventi.js';

const updateOrario = () => {
    let now = new Date();
    let dto = {
        now: parseInt(now.getTime()),
        ofl: (new Date(orarioFineLavori)).getTime(),
    };
    dto.diff = dto.ofl - dto.now;
    dto.secondiAllaFine = dto.diff / 1000;
    secondiAllaFine = dto.secondiAllaFine;
};

const updateCountDown = () => {
    if (--secondiAllaFine >= 0) {
        document
            .querySelector('.countdown')
            .innerHTML = clock(secondiAllaFine);
    }
};

const checkVisibility = () => {
    if (secondiAllaFine <= 0) {
        document
            .querySelector('.countdown-wrapper')
            .style.visibility = 'hidden';
        emit('coundown_completed');
    } else {
        document
            .querySelector('.countdown-wrapper')
            .style.visibility = 'visible';
    }
};

const countdown = () => {
    updateOrario();
    updateCountDown();
    checkVisibility();
    setTimeout(countdown, 1000);
};

countdown();
