let path = require('path');
let validate = require('schema-utils');
let schema = require("./optionSchema.json");
let postcss = require('postcss');
let htmlWebpackPlugin = require('html-webpack-plugin');
class ThemePlugin {
    constructor(options = {}) {
        validate(options, schema);
        this.options = options;
        console.log('init:', this.options);
    }
    apply(compiler) {
        // compiler.hooks.emit.tap('themePlugin', (compilation) => {
            // compilation.hooks.emit
            // htmlWebpackPlugin.getHooks(compilation).beforeAssetTagGeneration.tapAsync('themePlugin', (data, cb) => {
            //     const { assets } = data;
            //     const { css } = assets;
            //     for(const x of css) {
            //         console.log(x);
            //     }
            //     cb();
            // });
            // htmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync('themePlugin', (data, cb) => {
            //     const { assetTags } = data;
            //     const { styles } = assetTags;
            //     for(const style of styles) {
            //         console.log(style);
            //     }
            // });
        // });
        compiler.hooks.emit.tapAsync('themePlugin', (compilation, cb) => {
            // console.log(compilation);
            const { assets } = compilation;
            for(const key in assets) {
                if(key.endsWith('.css')) {
                    console.log('key:', key);
                    console.log(assets[key].source());
                }
            }
        });

    }
}
ThemePlugin.loader = path.resolve(__dirname, "./loader");
module.exports = ThemePlugin;