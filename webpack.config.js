const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const path = require('path');

module.exports = {
    mode: 'production',
    entry: './example/map.ts',
    output: {
        libraryTarget: 'umd',
        filename: 'map.js',
        path: path.resolve(__dirname, 'example-dist'),
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    },
                    'ts-loader'
                ],
                exclude: /node_modules/
            },
            {
                test: /\.css$/i,
                use: [
                    "style-loader",
                    "css-loader"
                ],
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        plugins: [new TsconfigPathsPlugin({ configFile: "./tsconfig.dev.json" })]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./example/index.html"
        }),
        new CleanWebpackPlugin()
    ]
}