/**
 * @author guan
 * 
 * provides public data get/set, event listen/ignore/notify and DOM manipulation 
 */
var SandBox = (function() {
    /**
     * public data used among modules
     */
    var pubData = {},
    /**
     * used in show and hide function
     * 
     * visibilityMode == 0: change display(""<->"none") of element's style
     * visibilityMode == 1: change visibility("visible"<->"hidden") of element's style
     * visibilityMode == 2; use position(absolute) and left of element's style
     */
    visibilityMode = 0;
    /**
     * @param {Core} core
     * @param {string} moduleName
     * 		module name
     * @constructor
     */
    var SandBox = function(core, moduleName) {
        if(!moduleName) {
            core.log("SandBox.constructor: module name should be defined");
            return;
        }
        this.moduleName = moduleName;
        this.container = document.getElementById(moduleName);
        this.core = core;
        this.xhr = new XMLHttpRequest();
    };
    SandBox.setVisibilityMode = function(mode) {
        visibilityMode = mode;
    };
    /**
     * get/set public data
     * if value is defined, set data, or get data
     * 
     * @param {string} name
     * 		data name
     * @param {object} value
     * 		data value
     * 
     * @returns {object|undefined}
     */
    SandBox.prototype.data = function(name, value) {
        if(typeof value != "undefined") {
            pubData[name] = value;
        }
        else {
            return pubData[name];
        }
    };
    /**
     * remove public data
     * 
     * @param {string} name
     * 		data name
     */
    SandBox.prototype.removeData = function(name) {
        delete pubData[name];
    };
    /**
     * notify event registered by events
     * 
     * @param {string} evtObj
     * @see Core.triggerEvent
     */
    SandBox.prototype.notify = function(evtObj) {
        this.core.triggerEvent(evtObj);
    };
    /**
     * listen events
     * 
     * @param {object} evts 
     * 		{{string} eventName: {function(data:object) fn}}
     */
    SandBox.prototype.listen = function(evts) {
        for(var evt in evts) {
            this.core.registerEvent(this.moduleName, evt, evts[evt]);
        }
    };
    /**
     * ignore events
     * 
     * @param {Array.<string>} evts
     * 		events' name
     */
    SandBox.prototype.ignore = function(evts) {
        for(var i = 0, evt; evt = evts[i]; i++) {
            this.core.unregisterEvent(this.moduleName, evt);
        }
    };
    /**
     * parse selector (.@/)
     * 
     * @param {string} selector
     */
    SandBox.prototype.parseSel = function(selector) {
        return selector.replace(/@/g, "\\@")
        .replace(/\//g, "\\/")
        .replace(/\./g, "\\.");
    };
    /**
     * find one DOM element
     * 
     * @param {string} selector
     * @param {DOMElement} ctx
     * 		context
     * 
     * @returns {DOMElement}
     */
    SandBox.prototype.find = function(selector, ctx) {
        ctx = ctx || this.container;
        return ctx.querySelector(selector);
    };
    /**
     * query DOM elements
     * 
     * @param {string} selector
     * @param {DOMElement} ctx
     * 		context
     * 
     * @returns {Array.<DOMElement>}
     */
    SandBox.prototype.query = function(selector, ctx) {
        ctx = ctx || this.container;
        return ctx.querySelectorAll(selector);
    };
    /**
     * add class to DOM element
     * 
     * @param {DOMElement} elem
     * @param {string} className
     */
    SandBox.prototype.addClass = function(elem, className) {
        if(elem.classList) {
            elem.classList.add(className);
        }
        else {
            var clses = elem.className.split(" "), 
            cls, len = clses.length, find = false;
            for(var i = 0; i < len; i++) {
                if(cls == className) {
                    find = true;
                    break;
                }
            }
            if(!find) {
                elem.className += " " + className;
            }
        }
    };
    /**
     * remove class of DOM element
     * 
     * @param {DOMElement} elem
     * @param {string} className
     */
    SandBox.prototype.removeClass = function(elem, className) {
        if(elem.classList) {
            elem.classList.remove(className);
        }
        else {
            var clses = elem.className.split(" "), 
            cls, len = clses.length;
            for(var i = 0; i < len; i++) {
                cls = clses[i];
                if(cls == className) {
                    if(i == 0) {
                        if(clses.length > 1) {
                            className = className + " ";
                        }
                    }
                    else {
                        className = " " + className;
                    }
                    elem.className = elem.className.replace(className, "");
                    break;
                }
            }
        }
    };
    /**
     * check if DOM element has specified class
     * 
     * @param {DOMElement} elem
     * @param {string} className
     */
    SandBox.prototype.hasClass = function(elem, className) {
        if(elem.classList) {
            return elem.classList.contains(className);
        }
        else {
            var clses = elem.className.split(" "),
            cls, len = clses.length;
            for(var i = 0; i < len; i++) {
                cls = clses[i];
                if(cls == className) {
                    return true;
                }
            }
            return false;
        }
    };
    /**
     * show element
     * 
     * @param {DOMElement} elem
     */
    SandBox.prototype.show = function(elem) {
        switch (visibilityMode) {
            case 0:
                elem.style.display = "";
                break;
            case 1:
                elem.style.visibility = "visible";
                break;
            case 2:
                var oldPosition = elem.style.oldPosition,
                oldLeft = elem.style.oldLeft;
                if(oldPosition) {
                    elem.style.position = oldPosition;
                }
                else {
                    elem.style.position = "";
                }
                if(oldLeft) {
                    elem.style.left = oldLeft;
                }
                else {
                    elem.style.left = "";
                }
                elem.isHidden = false;
                break;
            default:
                break;
        }
    };
    /**
     * hide element
     * 
     * @param {DOMElement} elem
     */
    SandBox.prototype.hide = function(elem) {
        switch (visibilityMode) {
            case 0:
                elem.style.display = "none";
                break;
            case 1:
                elem.style.visibility = "hidden";
                break;
            case 2:
                if(elem.isHidden) {
                    return;
                }
                var comStyle = getComputedStyle(elem);
                elem.style.oldPosition = comStyle.position;
                elem.style.oldLeft = comStyle.left;
                elem.style.position = "absolute";
                elem.style.left = "-2000px";
                elem.isHidden = true;
                break;
            default:
                break;
        }
    };
    /**
     * the same as document.createElement
     * 
     * @param {string} tagName
     */
    SandBox.prototype.elem = function(tagName) {
        return document.createElement(tagName);
    };
    /**
     * trim string
     * 
     * @param {string} str
     * @returns {string}
     */
    SandBox.prototype.trim = function(str) {
        return str.replace(/(^\s*)|(\s*$)/g, "");
    };
    /**
     * return nextSibling but ignore text node
     * 
     * @param {HTMLElement} elem
     * @returns {HTMLElement}
     */
    SandBox.prototype.next = function(elem) {
        var sibl = elem.nextSibling;
        while(sibl) {
            if(sibl.nodeType == 1) {
                return sibl;
            }
            sibl = sibl.nextSibling;
        }
    };
    /**
     * return previousSibling but ignore text node
     * 
     * @param {HTMLElement} elem
     * @returns {HTMLElement}
     */
    SandBox.prototype.prev = function(elem) {
        var sibl = elem.previousSibling;
        while(sibl) {
            if(sibl.nodeType == 1) {
                return sibl;
            }
            sibl = sibl.previousSibling;
        }
    };
    /**
     * execute in queue
     * 
     * @param {object...} objs
     */
    SandBox.prototype.queue = function() {
        var fns = function() {}, oldFns;
        for (var i = arguments.length - 1, obj; i >= 0; i--) {
            obj = arguments[i];
            oldFns = fns;
            (function(obj, oldFns) {
                fns = function() {
                    setTimeout(function() {
                        obj.fn();
                        oldFns();
                    }, obj.time || 0);
                };
            })(obj, oldFns);
        }
        fns();
    };
    /**
     * bind event to object
     * 
     * @param {object} obj
     * @param {string} eventName
     * @param {Function} fn
     */
    SandBox.prototype.bind = function(obj, eventName, fn) {
        Core.bind(obj, eventName, fn);
    };
    /**
     * unbind event from element
     * 
     * @param {object} obj
     * @param {string} eventName
     * @param {Function} fn
     */
    SandBox.prototype.unbind = function(obj, eventName, fn) {
        Core.unbind(obj, eventName, fn);
    };
    /*
     *load an image from imagefile selection
     * @returns {DOMElement}
     */
    SandBox.prototype.addImage = function(obj){
        var image  = new Image(),URL = window.webkitURL|| window.mozURL||window.URL;
        var src = URL.createObjectURL(obj.files.item(0));
        //       image.src = src;
        if(obj.files){
            var reader = new FileReader();
            reader.onerror = function(e){
                Core.log(e.message);
            }
            reader.readAsDataURL(obj.files.item(0));
            reader.onload = function(){
                image.src = reader.result;
            };
            return image;
        }
    //        return image;
    };
    /*
     *load an image as DataURL from imagefile selection
     * @returns {DOMElement}
     */
    SandBox.prototype.readAsDataURL = function(obj){
        var image = new Image();
        if(obj){
            //ie
            if (window.navigator.userAgent.indexOf("MSIE")>=1){
                obj.select();
                // IE下取得图片的本地路径
                image.src = document.selection.createRange().text;
            }
            //非IE类浏览器暂时兼容firefox，chrome or opera?or safary? or mobile brower?
            else{
                if(obj.files){
                    var reader = new FileReader();
                    reader.onerror = function(e){
                        Core.log(e.message);
                    }
                    reader.readAsDataURL(obj.files.item(0));
                    reader.onload = function(){
                        image.src = reader.result;
                    };
                }
            }
            return image;
        }
        return null;
    };
    SandBox.prototype.readFileData = function(obj, callback){
        var _this =this;
        if(obj && obj.files){
            var reader = new FileReader();
            reader.onerror = function(e){
                Core.log(e.message);
            }
            reader.readAsDataURL(obj.files.item(0));
            reader.onload = function(){
                callback && callback.call(_this, reader.result) ;
            };
        }
    };
    SandBox.prototype.subrgb = function(rgb){
        var indexA,indexB,numstr,numStrArr,numArr = [],item;
        indexA = rgb.indexOf("(");
        indexB = rgb.indexOf(")");
        if(indexA==-1||indexB==-1) return null;
        numstr = rgb.substring(indexA+1, indexB);
        numStrArr = numstr.split(",");
        for (var i = 0; item  = numStrArr[i]; i++) {
            numArr[i] = parseInt(item);
        }
        return numArr;
    };
    SandBox.prototype.subColorHexToInt = function(hex){
        var arr = [];
        arr[0] = parseInt(hex.substr(1,2),16);
        arr[1] = parseInt(hex.substr(3,2),16);
        arr[2] = parseInt(hex.substr(5,2),16);
        return arr;
    };
    SandBox.prototype.subColorHex = function(hex){
        var arr = [];
        arr[0] = hex.substr(1,2);
        arr[1] = hex.substr(3,2);
        arr[2] = hex.substr(5,2);
        return arr;
    };
    /*
     * Fixed the img
     * @param {object} obj
     * @param {Number} x
     *          width
     * @param {Number} y
     *          height
     * @returns {Object}
     */        
    SandBox.prototype.fixedImgSize = function(obj,x,y){
        var min_x = 50,min_y = 50;
        obj.height= obj.height <min_x?min_x:obj.height;
        obj.width= obj.width <min_y?min_y:obj.width;
        var scaley = obj.height/y,scalex=obj.width/x;
        if(scaley>1||scalex>1){
            if(scaley>scalex){
                obj.height = obj.height/scaley;
                obj.width = obj.width/scaley;
            }
            else{
                obj.height = obj.height/scalex;
                obj.width = obj.width/scalex; 
            } 
        }
        return obj;
    }
    SandBox.prototype.ObjectLink = function(){
    }
    /*
     *insert a element into a Object-set
     *
     * @param {Object} elem
     * @param {String} seq
     * @param {String} insert 
     *
     */
    SandBox.prototype.ObjectLink.prototype.insert = function(elem,seq,insert){
        var obj = {},inValue = null,flag = false;
        if(seq=="append"){
            this[elem.key] = elem.value;
            return;
        }
        for(var o in this){
            if(this.hasOwnProperty(o)){
                if(o==insert){
                    flag = true;
                    inValue=this[o];
                }
                if(flag) {
                    obj[o] = this[o];
                    delete this[o];
                }
            }   
        }
        if(seq=="before"){
            delete this[insert];
            this[elem.key] = elem.value;
            this[insert] =  inValue;
        }else{
            this[elem.key] = elem.value;
        }
        for(var ap in obj){
            if(obj.hasOwnProperty(ap)){
                this[ap] = obj[ap];
            }
        }
    };
    /*
     *find the index of a specify object in the specify obj-set
     *index begin of 1
     *
     *@param {String} attName
     *@returns {Number}
     */
    SandBox.prototype.ObjectLink.prototype.findIndex = function(attName){
        var i = 0;
        for(var o in this){
            if(this.hasOwnProperty(o)){
                i++;
                if(attName==o){
                    return i;
                }
            }   
        }
        return -1;
    };
    /*
     * sub a set from indexA to indexB ; indexA,indexB value begin in 1
     * if indexB > indexA ,indexB = this.length
     *
     * @param { Number } indexA
     * @param { Number } indexB
     * @returns { Array.<String> }
     *
     */
    SandBox.prototype.ObjectLink.prototype.subSet = function(indexA,indexB){
        var i = 1 , j=0 , flag = false , array = [];
        if( indexA > indexB ){
            Core.log("wrong params in function:subset !");
            return null;
        }
        for( var o in this ){
            if(this.hasOwnProperty(o)){
                if(indexA==i) flag =true;
                if(flag){
                    array[j] = o;
                    j++;
                }
                if(indexB==i) return array;
                i++;
            }
        }
        return array;
    }
    /*
     *return size
     *
     *@returns {Number}
     *
     */
    SandBox.prototype.ObjectLink.prototype.length = function(){
        var i = 0;
        for(var o in this){
            if(this.hasOwnProperty(o))
                i++;
        }
        return i;
    }
    /*
     *@returns {String}
     */
    SandBox.prototype.ObjectLink.prototype.getFirstElement = function(){
        for(var s in this){
            if(this.hasOwnProperty(s)){
                return s;
            }    
        }
        return null;
    };
    /*
     *@returns {String}
     */    
    SandBox.prototype.ObjectLink.prototype.getLastElement = function(){
        var o = null;
        for(var s in this){
            if(this.hasOwnProperty(s)) o = s;
        }
        return o;
    };
    /*
     *@param {String} att
     *
     */    
    SandBox.prototype.ObjectLink.prototype.sortBy = function(att){
        var arrA = this.toArray(),o;
        arrA.sort(function(a,b){
            if(a["value"][att]<b["value"][att]) return -1;
            else if(a["value"][att]>b["value"][att]) return 1;
            return 0;
        });
        this.clear();
        for (var i = 0; o = arrA[i]; i++) {
            this[o["key"]] = o["value"];
        }
    };
    /*
     *delete all properties
     */  
    SandBox.prototype.ObjectLink.prototype.clear = function(){
        for (var o in this) {
            if(this.hasOwnProperty(o))
                delete this[o];
        }
    };
    /*
     *@returns {Array.<Object>}
     */    
    SandBox.prototype.ObjectLink.prototype.toArray = function(){
        var arrA = [],j=0;
        for(var o in this){
            if(this.hasOwnProperty(o)){
                arrA[j] = {
                    key:o,
                    value:this[o]
                };
                j++;
            }
        }
        return arrA;
    };
    SandBox.prototype.ObjectLink.prototype.forEach = function(func){
        for(var o in this){
            if(this.hasOwnProperty(o)){
                func(this[o],o);
            }
        }
    };
    /*
     *seq:pre next first last,index:-1 1 2 3....,tar: the target slider-elementID
     *
     *@param {String} seq
     *@param {String} tar
     *@param {Number} index
     *@returns {String}
     *
     */
    SandBox.prototype.ObjectLink.prototype.getSlider = function(seq,tar,index){
        var sliders = this;
        if(index!=-1){
            var i = 1;
            for(var s in sliders){
                if(sliders.hasOwnProperty(s)){
                    if(i==index){
                        return s;
                    }
                    else if(i>index){
                        return null;
                    }
                    i++;
                }
            }
        }
        else{
            if(!seq){
                Core.log("arguments are illegle when find the target in slider!");
                return null;
            }else if(seq!="first"&&seq!="last"&&!tar){
                Core.log("arguments are illegle when find the target in slider!");
                return null;
            }
            switch (seq) {
                case "first":
                    for(var s1 in sliders){
                        if(sliders.hasOwnProperty(s1))
                            return s1;
                    }
                    break;
                case "last":
                    var s22 = null;
                    for(var s2 in sliders){
                        if(sliders.hasOwnProperty(s2)){
                            s22 = s2;
                        }
                    }
                    return s22;
                    break;
                case "pre":
                    var ss = null;
                    for(var s3 in sliders){
                        if(sliders.hasOwnProperty(s3)){
                            if(s3==tar) return ss;
                            ss =s3
                        }
                    }
                    break;
                case "next":
                    var flag = false;
                    for(var s4 in sliders){
                        if(sliders.hasOwnProperty(s4)){
                            if(flag) return s4;
                            if(s4==tar) flag=true;
                        }
                    }
                    break;
                default:
                    return null;
                    break;
            }
        }
        return null;
    };
    /*
     * @param {String} pxv
     * @param {Number} len
     * @returns {Number}
     */
    SandBox.prototype.subPX = function(pxv,len){
        if(len||len==0) {
            if(typeof pxv != "string") pxv = pxv.toString();
            return parseInt(pxv.substr(0, pxv.length-len))|| parseFloat(pxv.substr(0, pxv.length-len));
        }
        else {
            return parseInt(pxv.substr(0, pxv.length-2))|| parseFloat(pxv.substr(0, pxv.length-2));
        }
    };
    SandBox.prototype.proxy = function(fn,ctx){
        return function(args){
            fn.apply(ctx, args);
        }
    };
    SandBox.prototype.ajaxPost = function(url,callback,args){
        var xhr =  this.xhr;
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        xhr.setRequestHeader("If-Modified-Since","0");
        xhr.onreadystatechange = function(){
            if(xhr.readyState==4&&xhr.status==200){
                callback();
            }  
        };
        xhr.send(args);
    };
    SandBox.prototype.ajaxGet = function(url,callback){
        var xhr =  this.xhr;
        xhr.open("GET", url);
        xhr.onreadystatechange = function(){
            if(xhr.readyState==4&&xhr.status==200){
                callback();
            }  
        };
        xhr.send();
    };
    SandBox.prototype.move = function(elem,tar, options){
        options = options || {};
        var initY=0,initX=0,pInitX=0,pInitY=0,
            scaling = options.scaling || 1,
        flag={
            isInit:false,
            isDown:false
        };
        this.ondrag(elem,flag, function(event){
            if(flag.isDown){
                var eventX = event.screenX*scaling;
                var eventY = event.screenY*scaling;
                if(!flag.isInit){
                    initX=eventX;
                    initY=eventY;
                    pInitX=parseInt(tar.style.left.substr(0, tar.style.left.length-2)),
                    pInitY=parseInt(tar.style.top.substr(0, tar.style.top.length-2)),
                    flag.isInit = true;
                }
                if (options.left) {
                    tar.style.left = (pInitX+eventX-initX)+"px";
                }
                else if (options.top) {
                    tar.style.top = (pInitY+eventY-initY)+"px";
                } else {
                    tar.style.left = (pInitX+eventX-initX)+"px";
                    tar.style.top = (pInitY+eventY-initY)+"px";
                }
            }
        });
    };
    SandBox.prototype.resizeRX =function(elem,tar,other){
        var initX=0,pInitW=0,
        flag={
            isInit:false,
            isDown:false
        };
        this.ondrag(elem,flag, function(event){
            if(flag.isDown){
                var clientX = event.screenX;
                if(!flag.isInit){
                    initX=clientX;
                    if(other)
                        pInitW = parseInt(other.style.width.substr(0, other.style.width.length-2));
                    else{
                        pInitW = parseInt(tar.style.width.substr(0, tar.style.width.length-2));
                    }
                    flag.isInit = true;
                }
                var diffResize = clientX-initX;
                diffResize = exFns.getRoateResize(tar, diffResize, 'cos');

                if(other) other.style.width = (pInitW+diffResize)+"px";
                else tar.style.width = (pInitW+diffResize)+"px";
            }
        });
    };
    SandBox.prototype.resizeLX =function(elem,tar,other){
        var initX=0,pInitW=0,pInitL,
        flag={
            isInit:false,
            isDown:false
        };
        this.ondrag(elem,flag, function(event){
            if(flag.isDown){
                var clientX = event.screenX;
                if(!flag.isInit){
                    initX=clientX;
                    if(other){
                        pInitW = parseInt(other.style.width.substr(0, other.style.width.length-2));
                    }
                    else{
                        pInitW = parseInt(tar.style.width.substr(0, tar.style.width.length-2));
                    }
                    pInitL = parseInt(tar.style.left.substr(0, tar.style.left.length-2));
                    flag.isInit = true;
                }
                var diffResize = clientX-initX;
                diffResize = exFns.getRoateResize(tar, diffResize, 'cos');

                if(other)  other.style.width = ( pInitW - diffResize ) + "px";
                else tar.style.width = ( pInitW - diffResize ) + "px";
                tar.style.left = ( pInitL + diffResize ) + "px";
            }
        });
    };
    SandBox.prototype.resizeBY =function(elem,tar,other){
        var initY=0,pInitH=0,
        flag={
            isInit:false,
            isDown:false
        };
        this.ondrag(elem,flag, function(event){
            if(flag.isDown){
                var eventY = event.screenY;
                if(!flag.isInit){
                    initY=eventY;
                    if(other)
                        pInitH = parseInt(other.style.height.substr(0, other.style.height.length-2));
                    else
                        pInitH = parseInt(tar.style.height.substr(0, tar.style.height.length-2));
                    flag.isInit = true;
                }
                var diffResize = eventY-initY;
                diffResize = exFns.getRoateResize(tar, diffResize, 'sin');
                if(other) other.style.height = (pInitH + diffResize)+"px";
                else tar.style.height = (pInitH + diffResize)+"px";
            }
        });
    };
    SandBox.prototype.resizeRB =function(elem,tar,other){
        var initY=0,initX=0,pInitW=0,pInitH=0,
        flag={
            isInit:false,
            isDown:false
        };
        this.ondrag(elem,flag, function(event){
            if(flag.isDown){
                var clientY = event.screenY;
                var clientX = event.screenX;
                if(!flag.isInit){
                    initY=clientY;
                    initX=clientX;
                    if(other){
                        pInitH = parseInt(other.style.height.substr(0, other.style.height.length-2));
                        pInitW = parseInt(other.style.width.substr(0, other.style.width.length-2));
                    }
                    else{
                        pInitH = parseInt(tar.style.height.substr(0, tar.style.height.length-2));
                        pInitW = parseInt(tar.style.width.substr(0, tar.style.width.length-2));
                    }
                    flag.isInit = true;
                }
                var diffResize = clientY-initY,
                    diffX = clientX-initX;
                diffResize = exFns.getRoateResize(tar, diffResize, 'sin');
                diffX = exFns.getRoateResize(tar, diffX, 'cos');
                if(other){
                    other.style.height = (pInitH+diffResize)+"px";
                    other.style.width = (pInitW+diffX)+"px";
                }else{
                    tar.style.height = (pInitH+diffResize)+"px";
                    tar.style.width = (pInitW+diffX)+"px";
                }
            }
        });
    };
    SandBox.prototype.resizeTY =function(elem,tar,other){
        var initY=0,pInitH=0,pInitT,
        flag={
            isInit:false,
            isDown:false
        };
        this.ondrag(elem,flag, function(event){
            if(flag.isDown){
                var eventY = event.screenY;
                if(!flag.isInit){
                    initY=eventY;
                    if(other){
                        pInitH = parseInt(other.style.height.substr(0, other.style.height.length-2));
                    }
                    else{
                        pInitH = parseInt(tar.style.height.substr(0, tar.style.height.length-2));
                    }
                    pInitT = parseInt(tar.style.top.substr(0, tar.style.top.length-2));
                    flag.isInit = true;
                }
                var diffResize = eventY-initY;
                diffResize = exFns.getRoateResize(tar, diffResize, 'sin');
                if(other) other.style.height = (pInitH - diffResize)+"px";
                else tar.style.height = (pInitH - diffResize)+"px";
                tar.style.top = (pInitT + diffResize)+"px";
            }
        });
    };
    SandBox.prototype.resizeLT =function(elem,tar,other){
        var initX,initY=0,pInitH=0,pInitT,pInitL,pInitW,
        flag={
            isInit:false,
            isDown:false
        };
        this.ondrag(elem,flag, function(event){
            if(flag.isDown){
                var eventY = event.screenY;
                var eventX = event.screenX;
                if(!flag.isInit){
                    initY=eventY;
                    initX = eventX;
                    if(other){
                        pInitH = parseInt(other.style.height.substr(0, other.style.height.length-2));
                        pInitW = parseInt(other.style.width.substr(0, other.style.width.length-2));
                    }
                    else{
                        pInitH = parseInt(tar.style.height.substr(0, tar.style.height.length-2));
                        pInitW = parseInt(tar.style.width.substr(0, tar.style.width.length-2));
                    }
                    pInitT = parseInt(tar.style.top.substr(0, tar.style.top.length-2));
                    pInitL = parseInt(tar.style.left.substr(0, tar.style.left.length-2));
                    flag.isInit = true;
                }
                var diffy = eventY-initY,
                    diffx = eventX-initX;
                diffy = exFns.getRoateResize(tar, diffy, 'sin');
                diffx = exFns.getRoateResize(tar, diffx, 'cos');

                if(other) {
                    other.style.height = (pInitH-diffy)+"px";
                    other.style.width = (pInitW-diffx)+"px";
                }
                else {
                    tar.style.height = (pInitH-diffy)+"px";
                    tar.style.width = (pInitW-diffx)+"px";
                }
                tar.style.top = (pInitT+diffy)+"px";
                tar.style.left = (pInitL+diffx)+"px";
            }
        });
    };
    SandBox.prototype.resizeLB =function(elem,tar,other){
        var initX,initY=0,pInitH=0,pInitL,pInitW,
        flag={
            isInit:false,
            isDown:false
        };
        this.ondrag(elem,flag, function(event){
            if(flag.isDown){
                var eventY = event.screenY;
                var eventX = event.screenX;
                if(!flag.isInit){
                    initY=eventY;
                    initX = eventX;
                    if(other){
                        pInitH = parseInt(other.style.height.substr(0, other.style.height.length-2));
                        pInitW = parseInt(other.style.width.substr(0, other.style.width.length-2));
                    }
                    else{
                        pInitH = parseInt(tar.style.height.substr(0, tar.style.height.length-2));
                        pInitW = parseInt(tar.style.width.substr(0, tar.style.width.length-2));
                    }
                    pInitL = parseInt(tar.style.left.substr(0, tar.style.left.length-2));
                    flag.isInit = true;
                }
                var diffy = eventY-initY,
                    diffx = eventX-initX;
                diffy = exFns.getRoateResize(tar, diffy, 'sin');
                diffx = exFns.getRoateResize(tar, diffx, 'cos');

                if(other) {
                    other.style.height = (pInitH+diffy)+"px";
                    other.style.width = (pInitW-diffx)+"px";
                }
                else {
                    tar.style.height = (pInitH+diffy)+"px";
                    tar.style.width = (pInitW-diffx)+"px";
                }
                tar.style.left = (pInitL+diffx)+"px";
            }
        });
    };
    SandBox.prototype.resizeRT =function(elem,tar,other){
       var initX,initY=0,pInitH=0,pInitT,pInitW,
        flag={
            isInit:false,
            isDown:false
        };
        this.ondrag(elem,flag, function(event){
            if(flag.isDown){
                var eventY = event.screenY;
                var eventX = event.screenX;
                if(!flag.isInit){
                    initY=eventY;
                    initX = eventX;
                    if(other){
                        pInitH = parseInt(other.style.height.substr(0, other.style.height.length-2));
                        pInitW = parseInt(other.style.width.substr(0, other.style.width.length-2));
                    }
                    else{
                        pInitH = parseInt(tar.style.height.substr(0, tar.style.height.length-2));
                        pInitW = parseInt(tar.style.width.substr(0, tar.style.width.length-2));
                    }
                    pInitT = parseInt(tar.style.top.substr(0, tar.style.top.length-2));
                    flag.isInit = true;
                }
                var diffy = eventY-initY,
                    diffx = eventX-initX;
                diffy = exFns.getRoateResize(tar, diffy, 'sin');
                diffx = exFns.getRoateResize(tar, diffx, 'cos');

                if(other) {
                    other.style.height = (pInitH-diffy)+"px";
                    other.style.width = (pInitW+diffx)+"px";
                }
                else {
                    tar.style.height = (pInitH-diffy)+"px";
                    tar.style.width = (pInitW+diffx)+"px";
                }
                tar.style.top = (pInitT+diffy)+"px";
            }
        });
    };
    SandBox.prototype.ondrag =function(elem,flag,handle){
        elem.setAttribute("draggable", false);
        elem.addEventListener("mousedown", function(e){
            if(e.button==0){
                flag.isDown = true;
            }
        }, false);
        window.addEventListener("mouseup", function(e){
            if(e.button==0){
                flag.isDown = false;
                flag.isInit = false;
            }
        }, false);
        window.addEventListener("mousemove",handle,false);

    };
    SandBox.prototype.click =function(elem,flag,handle){
        elem.addEventListener("mousedown", function (e){
            if(e.button==0){
                flag.isDown = true;
            }
        }, false);
        window.addEventListener("mouseup", function (e){
            if(e.button == 0 && flag.isDown === true){
                flag.isDown = false;
                handle(e);
            }
        }, false);
        window.addEventListener("mousemove",function (e) {
            if(e.button==0){
                flag.isDown = false;
            }
        },false);
    };
    SandBox.prototype.css = function(e,att){
        if(!e.style){
            e.setAttribute("style", "");
        }
        for (var a in att) {
            e.style[a] = att[a];
        }
    };
    SandBox.prototype.File = {
        save : function (fileName, content, success) {
            var type = 'text/plain';
            function onInitFs(fs) {
                function errorHandler(error) {
                    //文件已经存在就删除掉
                    if (error.code == FileError.INVALID_MODIFICATION_ERR) {
                        fs.root.getFile(fileName, {create: false}, removeFileHandler, errorHandler);
                    }
                }
                //删除存在的文件
                function removeFileHandler (fileEntry) {
                    fileEntry.remove(readySaveFileHandler)
                }
                //准备写文件
                function readySaveFileHandler () {
                    fs.root.getFile(fileName, {create: true}, writeFileHandler, errorHandler);
                }
                function writeFileHandler(fileEntry) {
                    fileEntry.createWriter(function(fileWriter) {
                        fileWriter.onwriteend = function(e) {
                            var urlfrg = fileEntry.toURL().split('/')
                                urlfrg.pop();
                                urlfrg.push('')
                                var url = urlfrg.join('/')
                                // location.href = url;
                                success(url);
                                // console.log('Write completed.');
                        };
                        fileWriter.onerror = function(e) {
                            console.log('Write failed: ' + e.toString());
                        };
                        var bb = new WebKitBlobBuilder(); 
                        bb.append(content);
                        fileWriter.write(bb.getBlob('text/plain'));
                    }, errorHandler);
                }
                fs.root.getFile(fileName, {create: true,exclusive : true}, writeFileHandler, errorHandler);
            }
            window.webkitRequestFileSystem(window.TEMPORARY, 1024*1024, onInitFs, function(e) {
                console.log('error :' ,e)
            });
        }
    }
    SandBox.prototype.drawShape = function (shape, color) {
        var canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');
            function star(ctx, x, y, r, p, m)
            {
                ctx.translate(x, y);
                ctx.moveTo(0,0-r);
                for (var i = 0; i < p; i++)
                {
                    ctx.rotate(Math.PI / p);
                    ctx.lineTo(0, 0 - (r*m));
                    ctx.rotate(Math.PI / p);
                    ctx.lineTo(0, 0 - r);
                }
                ctx.fill();
                ctx.restore();
            }
        switch (shape) {
            case 'triangle' :   
                canvas.setAttribute('height', '100');
                canvas.setAttribute('width', '200');
                ctx.fillStyle = color;
                ctx.moveTo(100,0);
                ctx.lineTo(0,100);
                ctx.lineTo(200,100);
                ctx.lineTo(100,0);
                ctx.fill();
                break;
            case 'circular' :
                canvas.setAttribute('height', '200');
                canvas.setAttribute('width', '200');
                ctx.fillStyle = color;
                ctx.arc(100, 100, 100, 100, 0, Math.PI);
                ctx.fill();
                break;
            case 'rectangle' : 
                canvas.setAttribute('height','200');
                canvas.setAttribute('width','200');
                ctx.fillStyle = color;
                ctx.fillRect(0, 0, 200, 200);
                break;
            case 'heart' :
                canvas.setAttribute('height','120');
                canvas.setAttribute('width','150');
                ctx.fillStyle = color;
                ctx.moveTo(75,40);
                ctx.bezierCurveTo(75,37,70,25,50,25);
                ctx.bezierCurveTo(20,25,20,62.5,20,62.5);
                ctx.bezierCurveTo(20,80,40,102,75,120);
                ctx.bezierCurveTo(110,102,130,80,130,62.5);
                ctx.bezierCurveTo(130,62.5,130,25,100,25);
                ctx.bezierCurveTo(85,25,75,37,75,40);
                ctx.fill();

                var img = ctx.getImageData(20,25,110, 100);
                var copyCnv = document.createElement('canvas');
                copyCnv.setAttribute('height','95');
                copyCnv.setAttribute('width','110');
                var ctx2 = copyCnv.getContext('2d');
                ctx2.putImageData(img,0,0);
                canvas = copyCnv;
                break;
            case 'star' : 
                canvas.setAttribute('height','200');
                canvas.setAttribute('width','200');
                ctx.fillStyle = color;
                star(ctx, 100, 100, 100, 5, 0.5);

                break;
            case 'message' :
                canvas.setAttribute('height','130');
                canvas.setAttribute('width','130');
                ctx.fillStyle = color
                ctx.moveTo(75,25);
                ctx.quadraticCurveTo(25,25,25,62.5);
                ctx.quadraticCurveTo(25,100,50,100);
                ctx.quadraticCurveTo(50,120,30,125);
                ctx.quadraticCurveTo(60,120,65,100);
                ctx.quadraticCurveTo(125,100,125,62.5);
                ctx.quadraticCurveTo(125,25,75,25);
                ctx.fill();

                var img = ctx.getImageData(25,25,110, 100);
                var copyCnv = document.createElement('canvas');
                copyCnv.setAttribute('height','100');
                copyCnv.setAttribute('width','100');
                var ctx2 = copyCnv.getContext('2d');
                ctx2.putImageData(img,0,0);
                canvas = copyCnv;
                break;
            case 'moon' : 
                canvas.setAttribute('height','200');
                canvas.setAttribute('width','100');
                ctx.fillStyle = color;
                ctx.arc(100,100,100,Math.PI/2,-Math.PI/2);
                ctx.moveTo(100,0);
                ctx.bezierCurveTo(0,40,40,180,100,200);
                ctx.fill();
                break;
            case 'polygon' : 
                canvas.setAttribute('height','200');
                canvas.setAttribute('width','200');
                ctx.fillStyle = color;
                star(ctx, 100, 100, 100, 10, 0.6);
                break;
            default : break;
        }
        var url =  canvas.toDataURL();
        return url;
    }

    SandBox.prototype.create = function(tagName){
        return document.createElement(tagName);
    };
    SandBox.prototype.getRoateResize = function (tar, diffResize, fnType) {
        var transform = $(tar).css('WebkitTransform');
        if (transform && transform.match('rotate')) {
            var rotate = transform.match(/rotate\(.*\)/)[0].replace(/^rotate\(/, '').replace(/deg\)$/, ''),
                rotateValue = parseFloat(rotate);
            // fnType && ( diffResize = diffResize*(Math[fnType](Math.PI*2 - Math.PI*rotateValue/180)));
        }
        return diffResize;
    }
    //获取两数比例
    SandBox.prototype.reduce = function reduce(numerator,denominator){
        var gcd = function gcd(a,b){
            return b ? gcd(b, a%b) : a;
        };
        gcd = gcd(numerator,denominator);
        return [numerator/gcd, denominator/gcd];
    }

    SandBox.prototype.lang = function () {
        var languages = localConfig.languages;
        curLanguage = window.navigator.language.toLocaleLowerCase().match(/zh/) ? languages['zh'] : languages['en']
        return curLanguage;
    }

    if (!SandBox.prototype.ObjectLink.prototype.toJSONString) {
        SandBox.prototype.ObjectLink.prototype.toJSONString = function (filter) {
            return JSON.stringify(this, filter);
        };
        SandBox.prototype.ObjectLink.prototype.parseJSON = function (filter) {
            return JSON.parse(this, filter);
        };
    }
    var pubSandBox = new SandBox(Core, "public_sandbox");
    SandBox.pub = function() {
        return pubSandBox;
    };

    var exFns = {
        getRoateResize : SandBox.prototype.getRoateResize
    }
    return SandBox;
})();
