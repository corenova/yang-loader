var loaderUtils = require('loader-utils');
var Yang = require('yang-js');

module.exports = function load(content) {
  var m = Yang.parse(content, {compile: false});
  var deps = {}, reqs = []
  if (/^(sub)?module$/.test(m.kind)) {
    for (var elem of [].concat(m.import, m.include)) {
      if (!elem) continue
      deps[elem.tag] = Yang.resolve(elem.tag)
    }      
  }
  for (var k in deps) {
    var filepath = deps[k]
    if (!filepath) throw new Error("unable to resolve '"+k+"' dependency, forgot to define yang.resolve?")
    this.addDependency(filepath);
    reqs.push("Yang.use(require("+loaderUtils.stringifyRequest(this, filepath)+"));")
  }
  this.cacheable && this.cacheable();
  return reqs.join("\n") + "\nmodule.exports = Yang.use(Yang.parse(" + JSON.stringify(content) +"));";

  function extracTag(x) { return x.tag }
}
