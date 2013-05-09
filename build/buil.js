/**
	此脚本用于构建主页引用文件数据包sourceMap
**/
var fs 		= require('fs'),
	UglifyJS = require("uglify-js"),
	cssmin = require('ycssmin').cssmin,
	file 	= 'index.html',
	cmpJS 	= '../sourceMap.js',
	source  =  {
		'footer' 		: 'footer.html',
		'header' 		: 'header.html',
		'blogHeader' 	: 'blog/blogHeader.html',
		'blogFooter' 	: 'blog/blogFooter.html',
		'cmThemeJS' 	: 'codemirror/codeMirrorThemes.js',
		'cmThemeCSS' 	: 'codemirror/codeMirrorThemes.css',
		'cmJS' 			: 'codemirror/codeMirrorJS.js',
		'cmCSS' 		: 'codemirror/codeMirrorCSS.css',
		'animationCSS'	: 'animation.css',
		'drawJS'		: 'drawJS/drawJS.js',
		'zepto'			: 'zepto.min.js',
		//ImpressJS
		'impressCSS' 	: 'impress/impress-demo.css',
		'impressJS' 	: 'impress/impress.js',
		'impressHeader' : 'impress/impressHeader.html',
		'impressFooter' : 'impress/impressFooter.html',
		'impressReader' : 'impress/impressReader.js',
		//showerJS
		'showerJS' 		: 'shower/shower.js',
		'showerCSS' 	: 'shower/shower.css',
		'showerHeader' 	: 'shower/showerHeader.html',
		'showerFooter' 	: 'shower/showerFooter.html',
		'showerReader' 	: 'shower/showerReader.js'
	}
var ctn,
	sourceMap = {};
console.log('create sourceMap object');
for (var name in source) {
	if (source[name].match(/.*\.js$/) && !source[name].match(/.*\.min\.js$/)) {
		console.log('$JS minify -> ' + name);
		ctn = UglifyJS.minify(source[name]).code;
	}
	else if (source[name].match(/.*\.css$/)) {
		console.log('#CSS minify -> ' + name);
		ctn = cssmin(fs.readFileSync(source[name], 'UTF-8'));
	}
	else {
		console.log('-common -> ' + name);
		ctn = fs.readFileSync(source[name], 'UTF-8');
	}
	// ctn = fs.readFileSync(source[name], 'UTF-8');
	sourceMap[name] = ctn;
}
console.log('write sourceMap file');
fs.writeFileSync(cmpJS, 'window._sourceMap = ' + JSON.stringify(sourceMap), 'UTF-8');