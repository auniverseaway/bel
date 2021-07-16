const blockLoader = (config, suppliedEl) => {
    const parentEl = suppliedEl || document;

    const addStyle = (location) => {
        const element = document.createElement('link');
        element.setAttribute('rel', 'stylesheet');
        element.setAttribute('href', location);
        document.querySelector('head').appendChild(element);
    };

    const initJs = async (element, block) => {
        // If the block scripts haven't been loaded, load them.
        if (block.scripts) {
            if (!block.module) {
                // eslint-disable-next-line no-param-reassign
                block.module = await import(`${block.location}${block.scripts}`);
            }
            // If this block type has scripts and they're already imported
            if (block.module) {
                block.module.default(element);
            }
        }
        element.classList.add('is-Loaded');
        return true;
    };

    /**
     * Unlazy each type of block
     * @param {HTMLElement} element
     */
    const loadElement = async (element) => {
        const { blockSelect } = element.dataset;
        const block = config.blocks[blockSelect];

        if (!block.loaded) {
            addStyle(`${block.location}${block.styles}`);
        }

        block.loaded = initJs(element, block);
    };

    /**
     * Iterate through all entries to determine if they are intersecting.
     * @param {IntersectionObserverEntry} entries
     * @param {IntersectionObserver} observer
     */
    const onIntersection = (entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                observer.unobserve(entry.target);
                loadElement(entry.target);
            }
        });
    };

    /**
     * Clean up variant classes
     * Ex: marquee--small--contained- -> marquee small contained
     * @param {HTMLElement} parent
     */
    const cleanVariations = (parent) => {
        const variantBlocks = parent.querySelectorAll('[class$="-"]');
        variantBlocks.forEach((variant) => {
            let { className } = variant;
            className = className.slice(0, -1);
            // eslint-disable-next-line no-param-reassign
            variant.className = '';
            const classNames = className.split('--');
            variant.classList.add(...classNames);
        });
    };

    /**
     * Load blocks
     * @param {HTMLElement} element
     */
    const init = (element) => {
        const isDoc = element instanceof HTMLDocument;
        const parent = isDoc ? document.querySelector('body') : element;
        const lazyLoad = isDoc && config.lazy;

        cleanVariations(parent);

        let observer;
        if (lazyLoad) {
            const options = { rootMargin: config.margin || '1000px 0px' };
            observer = new IntersectionObserver(onIntersection, options);
        }

        Object.keys(config.blocks).forEach((selector) => {
            const elements = parent.querySelectorAll(selector);
            elements.forEach((el) => {
                el.setAttribute('data-block-select', selector);
                if (lazyLoad) {
                    observer.observe(el);
                } else {
                    loadElement(el);
                }
            });
        });
    };

    const fetchFragment = async (path) => {
        const resp = await fetch(`${path}.plain.html`);
        if (resp.ok) {
            return resp.text();
        }
        return null;
    };

    const loadFragment = async (fragmentEl) => {
        const path = fragmentEl.querySelector('div > div').textContent;
        const html = await fetchFragment(path);
        if (html) {
            fragmentEl.insertAdjacentHTML('beforeend', html);
            fragmentEl.querySelector('div').remove();
            fragmentEl.classList.add('is-Visible');
            init(fragmentEl);
        }
    };

    /**
     * Add fragment to the list of blocks
     */
    // eslint-disable-next-line no-param-reassign
    config.blocks['.fragment'] = {
        loaded: true,
        scripts: {},
        module: {
            default: loadFragment,
        },
    };

    init(parentEl);
};

const insertGtm = () => {
    const gtm = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-K4JC9TV');`;

    const element = document.createElement('script');
    element.innerHTML = gtm;
    document.querySelector('head').appendChild(element);
};

const postLCP = () => {
    setTimeout(insertGtm, 3000);
};

const setLCPTrigger = () => {
    const lcpCandidate = document.querySelector('main > div:first-of-type > div:first-of-type img');
    console.log(lcpCandidate);
    if (lcpCandidate) {
        if (lcpCandidate.complete) {
            postLCP();
        } else {
            lcpCandidate.addEventListener('load', () => {
                postLCP();
            });
            lcpCandidate.addEventListener('error', () => {
                postLCP();
            });
        }
    } else {
        postLCP();
    }
};

const config = {
    lazy: true,
    margin: '100px 0px',
    blocks: {
        'header': {
            location: '/blocks/header/',
            styles: 'header.css',
            scripts: 'header.js',
        },
        'footer': {
            location: '/blocks/footer/',
            styles: 'footer.css',
        },
        'a[href^="https://www.youtube.com"]': {
            location: '/blocks/embed/',
            styles: 'youtube.css',
            scripts: 'youtube.js',
        }
    },
};
setLCPTrigger();
blockLoader(config);