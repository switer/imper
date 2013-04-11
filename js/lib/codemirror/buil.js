var fs = require('fs');

var content = fs.readFileSync('codemirror.min.js', 'UTF-8');
// console.log(content);
var encodeCtn = encodeURIComponent('http://');
console.log(encodeCtn);
response.write(content, 'utf-8')
response.setHeader('content', 'text/html');