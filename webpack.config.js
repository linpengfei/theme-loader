const path = require('path');
const ThemePlugin = require("./plugin/thema.plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.less$/,
                use: [
                    {
                    loader: 'style-loader',
                },
                {
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                        publicPath: './',
                    }
                },
                {
                    loader: 'css-loader',
                },
                {
                    loader: 'less-loader',
                },
                {
                    loader: ThemePlugin.loader,
                    options: {
                        themeFile: path.resolve(__dirname, "src/thema.less")
                    },
                }
            ]
            }
        ]
    },
    plugins: [
        new ThemePlugin({ themeFile: path.resolve(__dirname, "src/thema.less")}),
        new HtmlWebpackPlugin(),
        new MiniCssExtractPlugin({ filename: 'index.css'}),
        new CleanWebpackPlugin()
    ]
}
