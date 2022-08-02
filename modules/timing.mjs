export default function calcolo(start, level, somma = 0) {
    return level === 1
        ? start
        : parseInt(calcolo(start, level - 1, somma) * 1.3);
};
