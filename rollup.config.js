import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';

const globals = {
    classnames: 'classNames',
    i18next: 'i18next',
    'prop-types': 'PropTypes',
    react: 'React',
    'react-dom': 'ReactDOM',
    'react-i18next': 'reactI18next'
};

const external = Object.keys(globals);

if (process.env.NODE_ENV === 'production') {
    plugins.push(uglify({}, minify));
}

export default {
    name: 'reactCestbleuPopup',
    input: 'src/index.umd.js',
    output: {
        file: `dist/react-cestbleu-popup${process.env.NODE_ENV === 'production' ? '.min' : ''}.js`,
        format: 'umd'
    },
    globals,
    external,
    plugins: [
        babel({
            exclude: 'node_modules/**'
        }),
        resolve(),
        commonjs()
    ]
};
