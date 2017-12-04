import babel from 'rollup-plugin-babel';

export default {
    name: 'reactCestbleuPopup',
    input: 'src/index.js',
    output: {
        file: 'dist/react-cestbleu-popup.es.js',
        format: 'es'
    },
    external: [
        'classnames',
        'gator',
        'i18next',
        'lodash.isfinite',
        'lodash.isfunction',
        'lodash.isobject',
        'lodash.isstring',
        'lodash.keys',
        'prop-types',
        'react',
        'react-dom',
        'react-i18next'
    ],
    plugins: [
        babel({
            babelrc: false,
            presets: [
                ['env', { modules: false }],
                'react'
            ],
            plugins: [
                'external-helpers'
            ],
            exclude: 'node_modules/**'
        })
    ]
};
