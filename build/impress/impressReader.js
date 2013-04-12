var paintingBoards = {},
    targetSlider = null;
(function(){
    var impressContainer = document.getElementById("impress"),
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
                            'rotate-x' : -20,
                            'scale' : 2,
                            'z' : -150
                        }
            },
            'rotate-y' : {
                        "class" : '', 
                        "datas" : {
                            'rotate-y' : 20,
                            'scale' : 2,
                            'z' : -100
                        }
            },
            'rotate' : {
                        "class" : '', 
                        "datas" : {
                            'rotate' : 300,
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
        var len = 0;
        for(var key in map){
            if(map.hasOwnProperty(key)) len ++;
        }
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
    var module = {
        init:function(){
            var sqrtNum = getSqrt(DATA),
                _sHeight = 0,
                _sWidth = 0,
                _maxHeight = 0;

            for(var s in DATA){
                if(DATA.hasOwnProperty(s)){
                    var slider = document.createElement("DIV"),
                        panel = document.createElement("DIV"),
                        elements = DATA[s].element,
                        anim = animMap[DATA[s].anim];
                    console.log(animMap, DATA[s].anim, anim, animations, animations[anim]);
                    slider.appendChild(panel);
                    panel.setAttribute('style', DATA[s].panelAttr);
                    sliders[s] = slider;
                    var scale = 1;
                    if (anim && animations[anim] && animations[anim].datas.scale) {
                        scale = parseFloat(animations[anim].datas.scale)
                    }

                    var curColum = index % sqrtNum;
                        curRow = parseInt(index / sqrtNum);


                    if (curColum === 0) {
                        _sWidth = 0;
                        _maxHeight = ( parseInt(conf.height) * scale  + 100);
                    }
                    if (curRow >= 1 && curColum === 0) {
                        _sHeight += _maxHeight;
                    }
                    if (( parseInt(conf.height) * scale  + 100) > _maxHeight) {
                        _maxHeight = ( parseInt(conf.height) * scale  + 100);
                    }
                    


                    // _sHeight = parseInt(index / sqrtNum) * ( parseInt(conf.height)  + 100)

                    console.log(animations[anim].datas, scale, _sWidth, _sHeight, _maxHeight)
                    $(slider)
                            .css({
                                'height' : conf.height,
                                'width'  : conf.width
                            })
                            .data('x', _sWidth)
                            .data('y', _sHeight)
                            .addClass('step')

                    _sWidth += ( parseInt(conf.width) ) * scale + 100;

                    anim && animations[anim] && setAttr(slider, animations[anim]);

                    index ++;
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
                                elem = new Image();
                                elem.src = data.value;
                                elem.setAttribute("style", data.cAttr);
                                elem.style.zIndex = data.zIndex;
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
                    impressContainer.appendChild(slider);
                }
            }
            impress().init();
        },
        //cm需要resize来refresh
        triggerWindowResize : function () {
            var evt = document.createEvent("UIEvents");
            evt.initUIEvent('resize', true, true, window)
            window.dispatchEvent(evt);
        }
    };
    window.module = module;
    module.init();
}());