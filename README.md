imper
=====

An impress presentation/slider editor website for creating impress.js slider 
(impress.js is inspired by the idea behind prezi.com)

An presentation editor and the player powered by impress.js

### Imper Editor

[Imper editor website](http://switer.github.io/imper/)

### Imper Generation

[Imper generate impress Demo](http://switer.github.io/examples/imper.html#/step-1) 

[Imper generate google html5 slides Demo](http://switer.github.io/examples/html5slides.html)

### Imper Data Format
```javascript
{
  //globla config data
  "cntConf" : {
  	"height" : "600px",
		"width"  : "960px",
		"thumb"  : ""
	},
	//frame data set
	"cntData" : {
		//frame data
		"slider1" : {
			"anim": "", // frame transition animation
			"panelAttr": "", // frame panel style attr
			//frame elements data set
			"element": {
				//frame element data
				"data1":{
					"type"		: "DIV", // element type
					"cAttr"		: "", // element container style attr 
					"eAttr"		: "", // element style attr
					"pAttr"   : "", // element panel style attr
					"zIndex"	: 1, //z-index
					//[text box || code box :  text string, image || video : data url] 
					"value"		: "text content!" 
				},
				"data2":{
				        //...
				}
			}
		},
		//frame data
		"slider2" : {
			//...
		}
	}
}
```

### TODO List

*  English Version `*(Compeleted)`
*  Support multiple element selections while editing
*  Slider frame opertation(copy,paste,change position) `*(Compeleted)`
*  Touchable and support ipad device
*  Impress GUI map drag-drop editing

### License

The MIT License (MIT)

> Copyright (c) 2013 copyright Kaishe Guan (guankaishe@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
