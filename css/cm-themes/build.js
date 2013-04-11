var fs = require('fs'),
	cssmin = require('ycssmin').cssmin,
	minFile = '../cm.theme.css',
	content = "",
	fileCtn = '';

var files = fs.readdirSync('.');

for (var i = files.length - 1; i >= 0; i--) {
	if (files[i].match(/.*\.css$/)) {
		fileCtn = fs.readFileSync(files[i], encoding='utf8'),
	 	content +=  cssmin(fileCtn);
	}
};

fs.writeFileSync(minFile ,content, 'utf8');