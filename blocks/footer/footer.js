const FOOTER_PATHNAME = '/nav-footer';
const { pathname } = window.location;

const fetchNavHtml = async () => {
    const resp = await fetch(`${FOOTER_PATHNAME}`);
    if (resp.ok) {
        return resp.text();
    }
    return null;
};

const getNavDoc = async (html) => {
    const parser = new DOMParser();
    return parser.parseFromString(html, 'text/html');
};

const getLocalNav = (doc) => {
    const navContent = doc.querySelector('main').innerHTML;
    const navEl = document.createElement('nav');
    navEl.innerHTML = navContent;
    return navEl;
};

const insertNav = (nav) => {
    const header = document.querySelector('footer');
    header.insertBefore(nav, header.firstChild);
};

const isFooter = () => pathname !== FOOTER_PATHNAME;

const init = async (el, { setDomain }) => {
    if (isFooter()) {
        const html = await fetchNavHtml();
        if (html) {
            const doc = await getNavDoc(html);
            const nav = getLocalNav(doc);
            setDomain(nav);
            insertNav(nav);
        }
    }
};

export default init;