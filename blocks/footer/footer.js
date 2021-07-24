const LOCAL_DOMAIN = 'https://local.page';
const FOOTER_PATHNAME = '/footer-links';
const {
    protocol,
    hostname,
    port,
    pathname,
} = window.location;

const getDomain = () => {
    const domain = `${protocol}//${hostname}`;
    return port ? `${domain}:${port}` : domain;
};
const CURRENT_DOMAIN = getDomain();

const fetchNavHtml = async () => {
    const resp = await fetch(`${CURRENT_DOMAIN}${FOOTER_PATHNAME}`);
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

const setDomainNav = (nav) => {
    const anchors = nav.getElementsByTagName('a');
    Array.from(anchors).forEach((anchor) => {
        const { href } = anchor;
        if (href.includes(LOCAL_DOMAIN)) {
            anchor.href = href.replace(LOCAL_DOMAIN, CURRENT_DOMAIN);
        }
    });
    return nav;
};

const insertNav = (nav) => {
    const header = document.querySelector('footer');
    header.insertBefore(nav, header.firstChild);
};

const isFooter = () => pathname !== FOOTER_PATHNAME;

const init = async () => {
    if (isFooter()) {
        const html = await fetchNavHtml();
        if (html) {
            const doc = await getNavDoc(html);
            const nav = getLocalNav(doc);
            setDomainNav(nav);
            insertNav(nav);
        }
    }
};

export default init;