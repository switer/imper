
var fs = require('fs')
	, files = ['index.html', 'main.html','slider.html'];
for (var i = files.length - 1; i >= 0; i--) {
	var content = fs.readFileSync(files[i], 'UTF-8')
	, cmprContent = content.replace(/\n\s*\n/g, '\n');
	fs.writeFileSync(files[i], cmprContent, 'UTF-8');
};
