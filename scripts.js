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
    }
};

const DEFAULT_LAZY_THRESHOLD = '0px 0px';

/**
 * Unlazy each type of image (picture, background, img)
 * @param {HTMLElement} image
 */
const loadElements = (element) => {
    console.log(element);
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
            loadElements(entry.target);
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
        console.log(parent);
    }

    const options = {
        rootMargin: DEFAULT_LAZY_THRESHOLD,
    };

    const observer = new IntersectionObserver(onIntersection, options);

    Object.keys(page.blocks).forEach((selector) => {
        const elements = parent.querySelectorAll(selector);
        elements.forEach(lazyElement => observer.observe(lazyElement));
    });

    return observer;
};

lazyLoadElements(document);
