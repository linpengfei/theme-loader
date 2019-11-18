const setItem = localStorage.setItem;
function theme(value) {
  if(!window.less) {
    import('less/dist/less.min.js').then(
      console.log(window.less);
    )
  }
  // return less.modifyVars(value);
}
window.theme = theme();