(function(){
    var showerContainer = $(".list")[0],
        sliders = {},
        index = 0,
        animMap = {
            'none' : 'slide',
            "anim-move-left"    : 'slide',
            "anim-move-right"   : 'slide',
            "anim-move-top"     : 'slide',
            "anim-move-bottom"  : 'slide',
            "anim-move-top-left"        : 'slide',
            "anim-move-top-right"       : 'slide',
            "anim-move-bottom-left"     : 'slide',
            "anim-move-bottom-right"    : 'slide',
            "anim-scale"    : 'scale',
            "anim-xSpin"    : 'rotate-x',
            "anim-ySpin"    : 'rotate-y',
            "anim-rightRotate"  : 'rotate',
            "anim-leftRotate"   : 'rotate',
        },
        animations = {

            'slide' : {
                        "class" : 'slide',
                        "datas" : {}
            },
            'scale' : {
                        "class" : 'slide',
                        "datas" : {
                            'scale' : 3
                        }
            },
            'rotate-x' : {
                        "class" : '', 
                        "datas" : {
                            'rotate' : -60,
                            'scale' : 2,
                            'z' : -150
                        }
            },
            'rotate-y' : {
                        "class" : '', 
                        "datas" : {
                            'rotate' : 60,
                            'scale' : 2,
                            'z' : -100
                        }
            },
            'rotate' : {
                        "class" : '', 
                        "datas" : {
                            'rotate' : 180,
                            'scale' : 3,
                            'z' : -200
                        }
            }
        }
    
    var datajson = document.getElementById('datajson').innerHTML,
        datas = JSON.parse(datajson),
        DATA = JSON.parse(datas.cntData),
        conf = datas.cntConf;

    function getSqrt(map) {
        var len = getLength(map);
        // for(var key in map){
        //     if(map.hasOwnProperty(key)) len ++;
        // }
        var sqrtNum = Math.sqrt(len);
        if (sqrtNum % 1 > 0) sqrtNum = parseInt(sqrtNum) + 1; 
        console.log(len, sqrtNum);
        return sqrtNum;
    }
    function setAttr(elem, map) {
        var datas = map.datas,
            className = map.class;
        $(elem).addClass(className);  
        for(var key in datas){
            if(datas.hasOwnProperty(key)) {
                $(elem).data(key, datas[key]);
            }
        }
    }
    function getLength(map) {
        var len = 0;
        for(var key in map){
            if(map.hasOwnProperty(key)) len ++;
        }
        return len;
    }
    var module = {
        init:function(){
            var sqrtNum = getSqrt(DATA),
                _sHeight = 0,
                _sWidth = 0,
                _maxHeight = 0,
                _maxHeightArr = [],
                _impressWidth = 0,
                _impressHeight = 0,
                _x = 0,
                _y = 0,
                _dataLength = getLength(DATA);

            for(var s in DATA){
                if(DATA.hasOwnProperty(s)){
                    var slider = document.createElement("DIV"),
                        panel = document.createElement("DIV"),
                        elements = DATA[s].element,
                        anim = animMap[DATA[s].anim],
                        sliderData = DATA[s];

                    slider.appendChild(panel);
                    DATA[s].panelAttr && panel.setAttribute('style', DATA[s].panelAttr);
                    sliders[s] = slider;
                    $(slider)
                            .addClass('slide')
                    
                    for (var e in elements) {
                        if(elements.hasOwnProperty(e)){
                            var data = elements[e],elem;
                            if(data.type === "DIV"){
                                elem = document.createElement("DIV");
                                elem.innerHTML = decodeURIComponent(data.value);
                                elem.setAttribute("style", data.cAttr + data.eAttr);
                                elem.style.zIndex = data.zIndex;
                            }
                            else if(data.type=="IMG"){

                                var panel = document.createElement('div');
                                var img = new Image();
                                elem = document.createElement('div');
                                //panel attr
                                data.pAttr && panel.setAttribute('style', data.pAttr);
                                //container attr
                                elem.setAttribute("style", data.cAttr);
                                elem.style.zIndex = data.zIndex;
                                img.src = data.value;
                                img.setAttribute("style", data.eAttr);
                                $(elem).append(panel).append(img);
                            }
                            else if (data.type==="VIDEO") {
                                elem = document.createElement("video");
                                var src = document.createElement("source");
                                src.src = data.value;
                                elem.appendChild(src);
                                elem.setAttribute("style", data.cAttr);
                                elem.setAttribute('controls', true);
                                elem.style.zIndex = data.zIndex;
                            }
                            else if (data.type==='CODE') {
                                var text = document.createElement("div");

                                elem = document.createElement("div");

                                elem.setAttribute("style", data.cAttr);
                                elem.style.zIndex = data.zIndex;
                                text.setAttribute("style", data.eAttr);
                                elem.appendChild(text);
                                (function (eData) {
                                        var codeMirror = CodeMirror(text, {
                                          value: eData.value,
                                          mode:  eData.codeType,
                                          theme:  eData.theme,
                                          lineNumbers  : true,
                                          lineWrapping  : true,
                                          readOnly : false
                                        });
                                        setTimeout(function () {
                                            module.triggerWindowResize();
                                        }, 10);
                                })(data)

                            }
                            if(elem) slider.appendChild(elem);
                        }
                    }
                    showerContainer.appendChild(slider);
                }
            }
                $(showerContainer).append(
                    '<p class="badge"><a href="https://github.com/switer/imper">Fork me on Github</a></p>' + 
                    '<div class="progress"><div></div></div>')
        }
    };
    window.module = module;
    module.init();
}());