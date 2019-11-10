let postcss = require('postcss');
let less = require('postcss-less-engine-latest');
let clean = require('postcss-clean');
let loaderUtils = require('loader-utils');
let validate = require('schema-utils');
let path = require('path');
let autoprefixer = require('autoprefixer');
const schema = require('./optionSchema.json');
let fs = require('fs');
let valList = new Set();
let themaFileInit = false;
function theamLoader(source) {
    // console.log(source);
    console.log('resourchPath', this.resourcePath);
    const option = loaderUtils.getOptions(this);
    console.log(option);
    let callback = this.async();
    validate(option, schema);
    this.options = option;
    const { themeFile } = option;
    // 读取文件内容

        console.warn('rexso:', this.resourcePath === this.themeFile);
    // console.log('themaFile:', themeContent);
    console.log('themaFileInit:',themaFileInit);
    // 样式文件未初始化，则先加载样式文件
    if(!themaFileInit) {
      const themeContent = fs.readFileSync(themeFile, { encoding: 'utf-8' }).toString();
      // const themeRoot = postcss.parse(themeContent, { from: themeFile });
      postcss([
        less(), 
        // autoprefixer(), 
        // clean()
      ])
      .process(themeContent, { parser: less.parser, from: themeFile })
      .then(result => {
        // console.log(result.css);
        result.root.walkAtRules( rule => {
        const { name } = rule;
        if (name !== "import") {
          valList.add(name.replace(/:$/, ""));
        }
        themaFileInit = true;
      });
        if(this.resourcePath === themeFile) {
          callback(null, source);
          return;
        }
          const root = fs.readFileSync(this.resourcePath, { encoding: 'utf-8' }).toString();
          // console.log(root);
          postcss([
            less(), 
            // autoprefixer(), 
            // clean()
          ])
          .process(root, { parser: less.parser, from: this.resourcePath })
          .then(result => {
            // console.log(result.css);
            let importTheme = false;
            result.root.walkAtRules('import', rule => {
              const params = rule.params.replace(/'/g, '').toString();
              if(/\.less$/.test(params) && path.resolve(this.context, params) === themeFile) {
                  // console.log('import theme file true');
                  importTheme = true;
              }
            });
                if (importTheme && valList.size) {
      const atRuleName = new Set();
      result.root.walkAtRules(rule => dealAtRule(rule, atRuleName));
      result.root.walkDecls(rule => dealDecl(rule, atRuleName));
      result.root.walkRules( rule => {
        // console.log(rule.selector);
        if (rule.nodes.length === 0) {
          let parent = rule.parent;
          rule.parent.removeChild(rule);
          // TODO 递归移除空树
          // while(parent) {
          //   if (rule.nodes.length === 0) {
          //     parent = parent.parent;
          //     rule.parent.removeChild(rule);
          //     rule = parent;
          //   }
          // }
        }
      });

    }
    callback(null, `/***THEMECSSBEGIN**${result.root.toString()}**THEMECSSEND**/${source}`);
      });
    });

    //todo 正则匹配过滤import？
    // themeRoot.walkAtRules( rule => {
    //   const { name } = rule;
    //   if (name !== "import") {
    //     valList.add(name.replace(/:$/, ""));
    //   }
    // });

    // const root = postcss.parse(source, { from: '' });
    // let importTheme = false;
    // root.walkAtRules('import', rule => {
    //     const params = rule.params.replace(/'/g, '').toString();
    //     if(/\.less$/.test(params) && path.resolve(this.context, params) === themeFile) {
    //         console.log('import theme file true');
    //         importTheme = true;
    //     }
    // });
    // if (importTheme && valList.size) {
    //   const atRuleName = new Set();
    //   root.walkAtRules(rule => dealAtRule(rule, atRuleName));
    //   root.walkDecls(rule => dealDecl(rule, atRuleName));
    //   root.walkRules( rule => {
    //     console.log(rule.selector);
    //     if (rule.nodes.length === 0) {
    //       let parent = rule.parent;
    //       rule.parent.removeChild(rule);
    //       // TODO 递归移除空树
    //       // while(parent) {
    //       //   if (rule.nodes.length === 0) {
    //       //     parent = parent.parent;
    //       //     rule.parent.removeChild(rule);
    //       //     rule = parent;
    //       //   }
    //       // }
    //     }
    //   })
    // }
    // if (root.nodes.length) {
    //   const ret = `/***THEMECSSBEGIN**${root.toString()}**THEMECSSEND**/${source}`;
    //   return ret;
    // }
    // console.log('root:',root.toString());
    // // console.log(root);
    // return source;
}
}
function dealAtRule(rule, atRuleName) {
  const { params, name } = rule;
  let remove = true;
  valList.forEach(key => {
    if (params.indexOf(key) !== -1) {
      remove = false;
      atRuleName.add(name.replace(/:$/, ""));
    }
  });
  if (remove) {
    rule.parent.removeChild(rule);
  }
}
function dealDecl(rule, atRuleName) {
  const { value } = rule;
  let remove = true;
  valList.forEach(key => {
    if (value.indexOf(key) !== -1) {
      remove = false;
    }
  });
  atRuleName.forEach(key => {
    if (value.indexOf(key) !== -1) {
      remove = false;
    }
  });
  if (remove) {
    rule.parent.removeChild(rule);
  }
}
module.exports = theamLoader;