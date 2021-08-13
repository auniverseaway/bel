const NAV_PATHNAME = '/nav';
const { pathname } = window.location;

const isNav = () => pathname !== NAV_PATHNAME;

const fetchNavHtml = async () => {
    const resp = await fetch(`${NAV_PATHNAME}`);
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

const insertNav = (nav) => {
    const header = document.querySelector('header');
    header.insertBefore(nav, header.firstChild);
};

const activateSubNav = (subNavPair) => {
    subNavPair.forEach((subnav) => {
        const { link, nav } = subnav;

        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (!link.classList.contains('is-Active')) {
                // Turn off all navs
                subNavPair.forEach((pair) => {
                    pair.link.classList.remove('is-Active');
                    pair.nav.classList.remove('is-Active');
                });
                // Turn on the current nav
                link.classList.toggle('is-Active');
                nav.classList.toggle('is-Active');
            } else {
                link.classList.remove('is-Active');
                nav.classList.remove('is-Active');
            }
        });
    });
};

const setupSubNav = (nav) => {
    const mainLinks = nav.querySelectorAll('ul:first-of-type > li > a');
    const subNav = Array.from(mainLinks).reduce((acc, link) => {
        const nextEl = link.nextElementSibling;
        if (nextEl && nextEl.tagName === 'UL') {
            acc.push({
                link,
                nav: nextEl,
            });
        }
        return acc;
        
    }, []);
    activateSubNav(subNav);
};

const setupMobileNav = (nav) => {
    const mobileLink = nav.querySelector('ul:first-of-type > li:first-of-type > a');
    mobileLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.target.closest('ul').classList.toggle('is-Active');
    });
};

const init = async (el, { setDomain }) => {
    if (isNav()) {
        const html = await fetchNavHtml();
        if (html) {
            const doc = await getNavDoc(html);
            const nav = getLocalNav(doc);
            setDomain(nav);
            insertNav(nav);
            setupSubNav(nav);
            setupMobileNav(nav);
        }
    }
};

export default init;
