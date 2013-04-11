var fs = require('fs'),
	UglifyJS = require("uglify-js");
function min() {
	var result = UglifyJS.minify("codeMirrorThemes.js");
	fs.writeFileSync('cm.theme.js', result.code, 'utf-8');
}
exports.min = min;
min();