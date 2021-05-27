window.page = {};
page.blocks = {
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
    '.client-carousel': {
        location: '/blocks/client-carousel/',
        styles: 'styles.css',
        scripts: 'scripts.js',
    },
    'a[href^="https://www.youtube.com"]': {
        location: '/blocks/embed/',
        styles: 'youtube.css',
        scripts: 'youtube.js',
    },
    '.experience-fragment': {
        location: '/blocks/xf/',
        scripts: 'scripts.js',
    }
};

const addCss = (location) => {
    var element = document.createElement('link');
    element.setAttribute('rel', 'stylesheet');
    element.setAttribute('href', location);
    document.querySelector('head').appendChild(element);
};

const initJs = async (element, block) => {
    // If the block scripts haven't been loaded, load them.
    if (block.scripts && !block.loaded) {
        const module = await import(`${block.location}${block.scripts}`);
        if (block.scripts && module.default) {
            block.module = module;
            block.module.default(element);
        };
        return true;
    }
    // If this block type has scripts and they're already loaded
    if (block.scripts && block.loaded) {
        block.module.default(element);
    }
    return true;
};

/**
 * Unlazy each type of block
 * @param {HTMLElement} element
 */
const loadElement = async (element) => {
    const { blockSelect } = element.dataset;
    const block = page.blocks[blockSelect];
    // Inject CSS
    if (!block.loaded && block.styles) {
        addCss(`${block.location}${block.styles}`);
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
const blockLoader = (element) => {
    let parent = element;
    if (element instanceof HTMLDocument) {
        parent = document.querySelector('body');
    }

    const options = { rootMargin: '10px 0px' };
    const observer = new IntersectionObserver(onIntersection, options);

    Object.keys(page.blocks).forEach((selector) => {
        const elements = parent.querySelectorAll(selector);
        elements.forEach((element) => {
            element.dataset.blockSelect = selector;
            observer.observe(element);
        });
    });

    return observer;
};

blockLoader(document);