const LOCAL_DOMAIN = 'https://local.page';
const NAV_PATHNAME = '/nav';
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

const isNav = () => pathname !== NAV_PATHNAME;

const fetchNavHtml = async () => {
    const resp = await fetch(`${CURRENT_DOMAIN}${NAV_PATHNAME}`);
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
    const navContent = doc.querySelector('main > div').innerHTML;
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
    const header = document.querySelector('header');
    header.insertBefore(nav, header.firstChild);
};

const init = async () => {
    if (isNav()) {
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
