const { parse } = require('marked');

module.exports = function (item) {
  item.html = parse(item.markdown);
  return item;
}