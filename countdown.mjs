import clock from './modules/clock.mjs';

function updateCountDown() {
    const seconds = --secondiAllaFine;
    if (secondiAllaFine >= 0) {
        document
            .querySelector('.countdown')
            .innerHTML = clock(secondiAllaFine);
    }
}

function checkVisibility() {
    if (secondiAllaFine <= 0) {
        document.querySelector('.countdown-wrapper').style.visibility = 'hidden';
        document.querySelector('.possible_constructions').style.visibility = 'visible';
    } else {
        document.querySelector('.countdown-wrapper').style.visibility = 'visible';
        document.querySelector('.possible_constructions').style.visibility = 'hidden';
    }
}

function countdown() {
    updateCountDown();
    checkVisibility();
    setTimeout(() => countdown(), 1000);
}

countdown();
