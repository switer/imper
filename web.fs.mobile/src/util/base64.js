var fs = require("fs");
function readAsBase64 (filename, writePath) {
	var content = fs.readFileSync(filename, 'base64');
	var filefrags = filename.split('.');
	if (filefrags.length > 0) {
		filefrags = filefrags.splice(0, filefrags.length -1);
		filefrags = filefrags.join('.')
	}
	fs.writeFileSync(filefrags + '.base64.js', 'var backIcon = "' + content + '"');
}
exports.readAsBase64 = readAsBase64;