// Scaffold our page object
const page = {};
page.blocks = {
    '.home-hero': {
        location: '/blocks/home-hero/',
        styles: 'styles.css',
    },
    'footer': {
        location: '/blocks/footer/',
        styles: 'styles.css',
        scripts: 'scripts.js',
        init: 'window.bel.blocks.footer.init',
    }
};

const getProperty = (object, objectPath) => {
    const pathArray = objectPath.split('.');
    return pathArray.reduce((acc, part) => acc && acc[part], object);
};

const getObjectProperty = (toggleKey, timeout) => new Promise((resolve) => {
    let i = 0;
    const interval = 100;
    const refreshId = setInterval(() => {
        const prop = getProperty(window, toggleKey);
        // Use not null in case 'false' is the prop.
        if (prop !== null && typeof prop !== 'undefined') {
            resolve(prop);
            clearInterval(refreshId);
        } else if (i >= timeout) {
            resolve(null);
            clearInterval(refreshId);
        }
        i += interval;
    }, interval);
});

const addCss = (location) => {
    var element = document.createElement('link');
    element.setAttribute('rel', 'stylesheet');
    element.setAttribute('href', location);
    document.querySelector('head').appendChild(element);
};

const addJs = (location) => {
    var element = document.createElement('script');
    element.setAttribute('type', 'module');
    element.setAttribute('src', location);
    document.querySelector('head').appendChild(element);
};

const initJs = (element, block) => {
    const promise = getObjectProperty(block.init, 1000);
    promise.then(initFunc => {
        initFunc(element);
    });
};

/**
 * Unlazy each type of image (picture, background, img)
 * @param {HTMLElement} element
 */
const loadElement = (element) => {
    const { blockSelect } = element.dataset;
    const block = page.blocks[blockSelect];
    // Inject CSS and JS to work
    if (!block.loaded) {
        if (block.styles) {
            addCss(`${block.location}${block.styles}`);
        }
        if (block.scripts) {
            addJs(`${block.location}${block.scripts}`);
        }
    }
    // Run JS against element
    if (block.scripts) {
        initJs(element, block);
    }
    block.loaded = true;
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
const lazyLoadElements = (element) => {
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

lazyLoadElements(document);
