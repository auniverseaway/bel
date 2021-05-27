const getDoc = (html) => {
    const parser = new DOMParser();
    return parser.parseFromString(html, 'text/html');
};

const fetchXf = async (path) => {
    const resp = await fetch(path);
    if (resp.ok) {
        return await resp.text();
    }
    return null;
};

const init = async (element) => {
    const path = element.querySelector('div > div').textContent;
    const html = await fetchXf(path);
    if (html) {
        const doc = getDoc(html);
        const main = doc.querySelector('main > div').innerHTML;
        element.insertAdjacentHTML('beforeend', main);
        element.querySelector('div').remove();
        element.style.visibility = 'visible';
    }
};

export default init;