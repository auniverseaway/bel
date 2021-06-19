const blockLoader = (config, suppliedEl) => {
    const parentEl = suppliedEl || document;

    const addStyle = (location) => {
        const element = document.createElement('link');
        element.setAttribute('rel', 'stylesheet');
        element.setAttribute('href', location);
        document.querySelector('head').appendChild(element);
    };

    const addScript = (location) => {
        const element = document.createElement('script');
        element.setAttribute('crossorigin', true);
        element.setAttribute('src', location);
        document.querySelector('head').appendChild(element);
    };

    const addDep = (dep) => {
        if (dep.styles) {
            dep.styles.forEach((style) => {
                addStyle(`${dep.location}${style}`);
            });
        }
        if (dep.scripts) {
            dep.scripts.forEach((script) => {
                addScript(`${dep.location}${script}`);
            });
        }
        // eslint-disable-next-line no-param-reassign
        dep.loaded = true;
    };

    const initJs = async (element, block) => {
        // If the block scripts haven't been loaded, load them.
        if (block.scripts) {
            if (!block.module) {
                /* eslint-disable-next-line */
                block.module = await import(`${block.location}${block.scripts}`);
            }
            // If this block type has scripts and they're already loaded
            if (block.module) {
                block.module.default(element);
            }
        }
        return true;
    };

    /**
     * Unlazy each type of block
     * @param {HTMLElement} element
     */
    const loadElement = async (element) => {
        const { blockSelect } = element.dataset;
        const block = config.blocks[blockSelect];
        // Load any block dependencies
        if (block.deps) {
            block.deps.forEach(async (dep) => {
                const depConfig = config.deps[dep];
                if (!depConfig.loaded) {
                    addDep(depConfig);
                }
            });
        }

        // Inject CSS
        if (!block.loaded && block.styles) {
            addStyle(`${block.location}${block.styles}`);
        }
        // Run JS against element
        block.loaded = await initJs(element, block);
    };

    const sanitizeClass = (element) => {
        let { className } = element;
        className = text.slice(0, -1);
        return className.split('--');
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
     * Lazily load blocks using an Intersection Observer.
     * @param {HTMLElement} element
     */
    const init = (element) => {
        const isDoc = element instanceof HTMLDocument;
        const parent = isDoc ? document.querySelector('body') : element;

        const options = { rootMargin: config.margin || '1000px 0px' };
        const observer = new IntersectionObserver(onIntersection, options);

        Object.keys(config.blocks).forEach((selector) => {
            const elements = parent.querySelectorAll(selector);
            elements.forEach((el) => {
                el.setAttribute('data-block-select', selector);

                // Assumes "Marquee (Small, Contained)" turns into "marquee--small--contained-"
                const blockVariant = el.className[el.className.length -1] === '-';
                if (blockVariant) {
                    let { className } = el;
                    className = text.slice(0, -1);
                    el.className = '';
                    const classNames = className.split('--');
                    el.classList.add(...classNames);
                }

                if (!isDoc || config.eager) {
                    loadElement(el);
                } else {
                    observer.observe(el);
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

const config = {
    margin: '100px 0px',
    blocks: {
        'header': {
            location: '/blocks/header/',
            styles: 'styles.css',
            scripts: 'scripts.js',
        },
        '.home-hero': {
            location: '/blocks/home-hero/',
            styles: 'styles.css',
        },
        'footer': {
            location: '/blocks/footer/',
            styles: 'styles.css',
        },
        'a[href^="https://www.youtube.com"]': {
            location: '/blocks/embed/',
            styles: 'youtube.css',
            scripts: 'youtube.js',
        },
        '.accordion': {
            location: '/blocks/accordion/',
            styles: 'styles.css',
        }
    },
};

blockLoader(config);