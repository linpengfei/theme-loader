const path = require('path');
const ThemePlugin = require("./plugin/theme.plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const lessVal = require('./src/theme');
console.log(lessVal);
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
                    options: {
                      globalVars: lessVal,
                      modifyVars: lessVal
                  }
                },
                {
                    loader: ThemePlugin.loader,
                    options: {
                      globalVars: lessVal,
                        themeFile: path.resolve(__dirname, "src/thema.less")
                    },
                }
            ]
            }
        ]
    },
    plugins: [
        new ThemePlugin({ globalVars: lessVal, themeFile: path.resolve(__dirname, "src/thema.less")}),
        new HtmlWebpackPlugin(),
        new MiniCssExtractPlugin({ filename: 'index.css'}),
        new CleanWebpackPlugin()
    ]
}
