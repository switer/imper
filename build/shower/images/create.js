/**
	此脚本用于构建主页引用文件数据包sourceMap
**/
var fs 		= require('fs'),
	source = {},
	prefix = "../images/",
	cssFile = fs.readFileSync('./screen.css');


var items = fs.readdirSync('./');
for (var i = items.length - 1; i >= 0; i--) {
	var item = items[i], content = '';
	if (item.match('.*\.svg')) {
		content = fs.readFileSync(item);
		source[item] = "'data:image/svg+xml," + content + "'";
		cssFile = (new String(cssFile)).replace(new RegExp(prefix + item, 'g'), source[item]);
		console.log('replace : ' + item);
	}
	else if (item.match('.*\.png')) {
		content = fs.readFileSync(item, 'base64');
		source[item] = "'data:image/png;base64," + content + "'";
		cssFile = (new String(cssFile)).replace(new RegExp(prefix + item, 'g'), source[item]);
		console.log('replace : ' + item);
	}
};

fs.writeFileSync('../shower.css', cssFile, 'utf-8')