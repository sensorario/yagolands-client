const template = document.createElement('template');

export const createFromHTML = (/** @type {string} */ html) => {
    template.innerHTML = html;
    return template.content;
};
