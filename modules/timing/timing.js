export const timing = (start, level, somma = 0) => (level === 1 ? start : parseInt(timing(start, level - 1, somma) * 1.3));
