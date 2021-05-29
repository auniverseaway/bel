const config = {
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
        '.fragment': {
            location: '/blocks/fragment/',
            scripts: 'scripts.js',
        }
    },
    deps: {
        'react': {
            location: 'https://unpkg.com/',
            scripts: ['react@17/umd/react.development.js', 'react-dom@17/umd/react-dom.development.js'],
        }
    },
};

const blockLoader = (element, config) => {
    const addStyle = (location) => {
        var element = document.createElement('link');
        element.setAttribute('rel', 'stylesheet');
        element.setAttribute('href', location);
        document.querySelector('head').appendChild(element);
    };

    const addScript = (location) => {
        var element = document.createElement('script');
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
        dep.loaded = true;
    };

    const initJs = async (element, block) => {
        // If the block scripts haven't been loaded, load them.
        if (block.scripts) {
            if (!block.module) {
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
        // Load any block dependency deps
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
     * Lazily load images using an Intersection Observer.
     * @param {HTMLElement} element
     */
    const init = (element) => {
        let parent = element;
        if (element instanceof HTMLDocument) {
            parent = document.querySelector('body');
        }
    
        const options = { rootMargin: '200px 0px' };
        const observer = new IntersectionObserver(onIntersection, options);
    
        Object.keys(config.blocks).forEach((selector) => {
            const elements = parent.querySelectorAll(selector);
            elements.forEach((element) => {
                element.dataset.blockSelect = selector;
                observer.observe(element);
            });
        });
    
        return observer;
    };

    init(element);
}

blockLoader(document, config);