const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: './example/map.ts',
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
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    mode: 'development',
    plugins: [
        new HtmlWebpackPlugin({
            template: "./example/index.html"
        }),
        new CleanWebpackPlugin()
    ],
    devServer: {
        port: 8085,
        open: true
    }
}