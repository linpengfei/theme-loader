let path = require('path');
let validate = require('schema-utils');
let schema = require("./optionSchema.json");
let postcss = require('postcss');
let htmlWebpackPlugin = require('html-webpack-plugin');
const contentReg = /\/\*\*THEMECSSBEGIN\*\*\n([\s\S]+)\n\*\*THEMECSSEND\*\*\//;
const themeContent = [];
class ThemePlugin {
    constructor(options = {}) {
        validate(options, schema);
        this.options = options;
        console.log('init:', this.options);
    }
    apply(compiler) {
        const { createHtmlTagObject } = htmlWebpackPlugin;
        compiler.hooks.emit.tap('themePlugin', (compilation) => {
            // compilation.hooks.emit
            // htmlWebpackPlugin.getHooks(compilation).beforeAssetTagGeneration.tapAsync('themePlugin', (data, cb) => {
            //     const { assets } = data;
            //     const { css } = assets;
            //     const { createHtmlTagObject } = htmlWebpackPlugin;
            //     for(const x of css) {
            //         console.log(x);
            //         const themeCss = createHtmlTagObject({ tagName: 'link', attributes: { ref: "stylesheet/less alternate stylesheet", type: "text/css",  href: "theme.less" } });
            //         css.push(themeCss);
            //     }
            //     cb();
            // });
            // htmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync('themePlugin', (data, cb) => {
            //     const { assetTags } = data;
            //     const { styles, scripts } = assetTags;

            //     const themeCss = createHtmlTagObject('link', { ref: "stylesheet/less", type: "text/css",  href: "theme.less" });
            //     styles.push(themeCss);
            //     scripts.push(createHtmlTagObject('script', { src: "http://cdnjs.cloudflare.com/ajax/libs/less.js/3.9.0/less.min.js" }));
            //     cb(null, data);
            // });
            htmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync('themePlugin', (data,cb) => {
                const { headTags } = data;
                headTags.push(createHtmlTagObject('link', { rel: "stylesheet/less",  href: "theme.less", type:"text/css" }));
                headTags.push(createHtmlTagObject('script', { src: "https://cdnjs.cloudflare.com/ajax/libs/less.js/3.10.3/less.js" }));
                cb(null, data);
            });
        });
        compiler.hooks.emit.tapAsync('themePlugin', (compilation, cb) => {
            // console.log(compilation);
            const { assets } = compilation;
            for(const key in assets) {
                if(key.endsWith('.css')) {
                    console.log('key:', key);
                    console.log(assets[key].source());
                    const source = assets[key].source();
                    const ret = contentReg.exec(source);
                    if(ret) {
                        console.log(ret[1]);
                        themeContent.push(ret[1]);
                    }
                }
            }
            if(themeContent.length) {
                  // 设置名称为 fileName 的输出资源
                  const fileContent = themeContent.join('');
  compilation.assets['theme.less'] = {
    // 返回文件内容
    source: () => {
      // fileContent 既可以是代表文本文件的字符串，也可以是代表二进制文件的 Buffer
      return fileContent;
      },
    // 返回文件大小
      size: () => {
      return Buffer.byteLength(fileContent, 'utf8');
    }
  };
            }
            console.log('themeContent:', themeContent.join(''));
            cb();
        });

    }
}
ThemePlugin.loader = path.resolve(__dirname, "./loader");
module.exports = ThemePlugin;