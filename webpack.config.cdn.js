const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path');

module.exports = {
    mode: 'production',
    entry: './lib/index.ts',
    plugins: [
    ],
    output: {
        libraryTarget: 'umd',
        filename: 'mapbox-extensions.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ],
            },
        ],
    },
    resolve: {
        extensions: [
            '.ts', '.js',
        ],
    },
    externals: {
        'mapbox-gl': 'mapboxgl'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                { from: "./lib/index.css", to: "./" }
            ]
        })
    ]
};