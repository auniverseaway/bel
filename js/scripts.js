import blockLoader from '../node_modules/@adobecom/blocks/tools/blockLoader.js';

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
    },
};

blockLoader(config);