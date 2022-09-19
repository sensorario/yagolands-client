export const clock = (/** @type {number} */ seconds) => {
    let sec = (seconds % 60).toString().padStart(2, '0');
    const min = (((seconds - sec) / 60) % 60).toString().padStart(2, '0');
    const hours = (((seconds - sec - min * 60) / 3600) % 24).toString().padStart(2, '0');
    const days = (seconds - sec - min * 60 - hours * 3600) / 86400;

    sec = parseInt(sec)
    const timeString = `${hours}h:${min}m:${sec}s`;

    if (days === 0) return timeString;

    const dd = days === 1 ? 'day' : 'days';

    return `${days} ${dd} and ${timeString}`;
};
