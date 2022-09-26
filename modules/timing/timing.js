const TIMING_FACTOR = 1.3;
const factors = Array(10);
for (let index = 0; index < factors.length; index++) {
    factors[index] = Math.floor((index ? factors[index - 1] : 1) * TIMING_FACTOR);
}
// TODO: a che serve somma?
export const timing = (start, level, somma = 0) => start * factors[level - 1]; /* + somma */
