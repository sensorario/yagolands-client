export default (start, level, somma = 0) => {
    return level === 1
        ? start
        : parseInt(f(start, level - 1, somma) * 1.3);
};
