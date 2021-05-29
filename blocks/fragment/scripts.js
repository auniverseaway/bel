const fetchXf = async (path) => {
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
        return await resp.text();
    }
    return null;
};

const init = async (element) => {
    const path = element.querySelector('div > div').textContent;
    const html = await fetchXf(path);
    if (html) {
        element.insertAdjacentHTML('beforeend', html);
        element.querySelector('div').remove();
        element.style.visibility = 'visible';
    }
};

export default init;