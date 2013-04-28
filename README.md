imper
=====

An impress presentation/slider editor website for creating impress.js slider 
(impress.js is inspired by the idea behind prezi.com)

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
			"anim"			: "",
			"panelAttr" 	: "",
			//frame elements data set
			"element"   		: {
				//frame element data
				"data1":{
					"type"		: "DIV",
					"cAttr"		: "",
					"eAttr"		: "",
					"zIndex"	: 1,
					"value"		: "text content text!"
				},
				"data1":{
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
