let postcss = require('postcss');
// let less = require('postcss-less-engine-latest');
// let clean = require('postcss-clean');
let loaderUtils = require('loader-utils');
let validate = require('schema-utils');
let path = require('path');
let autoprefixer = require('autoprefixer');
const schema = require('./optionSchema.json');
let fs = require('fs');
let valList = new Set();
let themaFileInit = false;
function theamLoader(source) {
    const option = loaderUtils.getOptions(this);
    validate(option, schema);
    this.options = option;
    const { themeFile } = option;
    // 读取文件内容
    // 样式文件未初始化，则先加载样式文件
    if(!themaFileInit) {
      const themeContent = fs.readFileSync(themeFile, { encoding: 'utf-8' }).toString();
      const themeRoot = postcss.parse(themeContent, { from: themeFile });
      themeRoot.walkAtRules( rule => {
        const { name } = rule;
        if (name !== "import") {
          valList.add(name.replace(/:$/, ""));
        }
        themaFileInit = true;
      });
    }
if(this.resourcePath === themeFile) {
  return source;
}
    const root = postcss.parse(fs.readFileSync(this.resourcePath, { encoding: 'utf-8' }).toString(), { from: this.resourcePath });
    let importTheme = false;
    root.walkAtRules('import', rule => {
      const params = rule.params.replace(/'/g, '').toString();
      if(/\.less$/.test(params) && path.resolve(this.context, params) === themeFile) {
          // console.log('import theme file true');
          importTheme = true;
      }
    });
    if (importTheme && valList.size) {
      const atRuleName = new Set();
      root.walkAtRules(rule => dealAtRule(rule, atRuleName));
      root.walkDecls(rule => dealDecl(rule, atRuleName));
      root.walkComments(comment => {
        comment.parent.removeChild(comment);
      })
      root.walkRules(rule => {
        if (rule.nodes.length === 0) {
          let parent = rule.parent;
          rule.parent.removeChild(rule);
          // 删除全部空树将会导致缺少一个分号
          // while(parent) {
          //   if(parent.nodes.length === 0) {
          //     const temp = parent;
          //     parent = parent.parent;
          //     temp.remove();
          //   } else {
          //     break;
          //   }
          // }
        }
      });
      // return  `/***THEMECSSBEGIN**${result.root.toString()}**THEMECSSEND**/${source}`;
    }
          if (importTheme && root.nodes.length) {
  const ret = `/**THEMECSSBEGIN**\r\n${root.toString()}\r\n**THEMECSSEND**/\r\n${source}`;
  return ret;
}
console.log('root:',root.toString());
// console.log(root);
return source;
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
  const { value, prop } = rule;
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
  if (remove || prop.startsWith('//')) {
    rule.parent.removeChild(rule);
  }
}
module.exports = theamLoader;