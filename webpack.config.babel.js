import path from 'path';
import webpack from 'webpack';

import packageJson from './package.json';

const NODE_ENV = process.env.NODE_ENV === 'production' ? 'production' : 'development';

const outputName = 'react-cestbleu-popup';

const config = {
    context: path.resolve(__dirname, 'src'),
    entry: {
        [`${outputName}`]: './index.js',
    },
    output: {
        library: 'geoportI18n',
        libraryTarget: 'umd',
        path: path.resolve(__dirname, 'dist'),
        filename: `[name]${NODE_ENV === 'development' ? '' : '.min'}.js`,
    },
    resolve: {
        modules: ['node_modules'],
        extensions: ['.js', '.jsx'],
    },
    resolveLoader: {
        modules: ['node_modules'],
        moduleExtensions: ['.js'],
    },
    externals: [
        "cestbleu",
        'react',
        'react-dom',
        "react-i18next",
        'i18next'
    ],
    module: {
        rules: [{
            test: /\.jsx?$/,
            use: 'babel-loader',
            include: [
                path.resolve(__dirname, 'src')
            ]
        }]
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
            VERSION: JSON.stringify(packageJson.version),
        }),
    ],
    devtool: NODE_ENV === 'development' ? 'source-map' : false,
};

if (NODE_ENV === 'production') {
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
        comments: false,
        compress: {
            warnings: false,
            drop_console: false,
            unsafe: false,
        },
        sourceMap: false,
    }));
}

export default config;
