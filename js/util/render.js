
(function(){
    var animMap = {
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
    
    

    function getSqrt(map) {
        var len = getLength(map);
        var sqrtNum = Math.sqrt(len);
        if (sqrtNum % 1 > 0) sqrtNum = parseInt(sqrtNum) + 1; 
        return sqrtNum;
    }
    function setAttr(elem, map) {
        var datas = map.datas,
            className = map.class;
        $(elem).addClass(className);  
        for(var key in datas){
            if(datas.hasOwnProperty(key)) {
                $(elem).data(key, datas[key]);
                switch(key) {
                    case 'rotate':
                        elem.style.WebkitTransform += ' rotate(' + datas[key] + "deg)";break;
                    case 'scale' : 
                        elem.style.WebkitTransform += ' scale(' + datas[key] + ")";break;
                    default : break;
                }
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
        render : function(DATA, conf, container, sb){
                // datas = JSON.parse(datajson),
                // DATA = JSON.parse(datas.cntData),
                // conf = datas.cntConf;
            var sqrtNum = getSqrt(DATA),
                sliders = {},
                index = 0,
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
                        labelPanel = document.createElement("DIV"),
                        elements = DATA[s].element,
                        anim = animMap[DATA[s].anim],
                        sliderData = DATA[s];


                    $(slider).append(panel).append(labelPanel);
                    panel.setAttribute('style', DATA[s].panelAttr);
                    sliders[s] = slider;
                    var scale = 1;
                    if (anim && animations[anim] && animations[anim].datas.scale) {
                        scale = parseFloat(animations[anim].datas.scale)
                    }

                    var curColum = index % sqrtNum;
                        curRow = parseInt(index / sqrtNum);

                    index ++;
                    $(labelPanel).html(index).css({
                        position    : 'absolute',
                        fontSize    : '100px',
                        color       : 'black',
                        left : '10px',
                        top : '0px',
                        zIndex : 9999
                    });

                    if (curColum === 0) {
                        _sWidth = 0;
                        _sHeight += _maxHeight;
                        _maxHeight = 0;
                    }

                    if (( parseInt(conf.height) * scale  + 100) > _maxHeight) {
                        _maxHeight = ( parseInt(conf.height) * scale  + 100);
                    }
                    var calcX =  _sWidth + parseInt(conf.width) * scale/2,
                        calcY =  _sHeight + parseInt(conf.height) * scale/2;

                    _x = !_.isEmpty(sliderData.x) ? sliderData.x : calcX;
                    _y = !_.isEmpty(sliderData.y) ? sliderData.y : calcY;
                    console.log(_x,_y)
                    $(slider)
                            .css({
                                backgroundColor : 'white',
                                position : 'absolute',
                                height : conf.height,
                                width  : conf.width,
                                top : _y + 'px',
                                left : _x + 'px'
                            })
                            .data('id', s)
                            .data('x', _x)
                            .data('y', _y)
                            .data('calcx', calcX)
                            .data('calcy', calcY)
                            .addClass('step')
                            .attr('draggable', false);

                    _sWidth += ( parseInt(conf.width) ) * scale + 100;

                    //in every row's last colum get the with and height
                    if (curColum === (sqrtNum - 1 ) || index >= _dataLength) {
                        //impress max  width
                        if (_sWidth > _impressWidth) _impressWidth = _sWidth;
                        _impressHeight += _maxHeight;
                    }
                    anim && animations[anim] && setAttr(slider, animations[anim]);

                    
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
                                $(img).attr('draggable', false);
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
                            if(elem){
                                $(elem).attr('draggable', false);
                                slider.appendChild(elem);
                            } 
                        }
                    }
                    container.appendChild(slider)
                }
            }
            var DEFAULT_SCALE = 5.5,
                scaling = DEFAULT_SCALE,
                wScaling = document.width / _impressWidth ,
                hScaling = document.height / _impressHeight;

            scaling = wScaling >= hScaling ? wScaling : hScaling;
            scaling = scaling > DEFAULT_SCALE ? scaling : DEFAULT_SCALE;

            container.style.WebkitTransform = 'scale(' + 1/scaling + ')';
            $(container).css({
                top : (($(container).parent().height() - _impressHeight / scaling) / 2 - 60)   + 'px',
                left : (($(container).parent().width() - _impressWidth / scaling) / 2 - 100)  + 'px',
            })
            var borderWidth = scaling >= 1 ? scaling : 1;
            // $('.step', container).css({
            //     'boxShadow' : '0 0 0 ' + borderWidth + 'px + black'
            // })

            var $sliders = $('.step', container);
            _.each($sliders, function (slider) {
                sb.move(slider, slider, {scaling : scaling});
            })
        },
        readAttributes : function (container) {
            var $sliders = $('.step', container),
                sliderDataset = {};
            _.each($sliders, function (slider) {
                var $slider = $(slider),
                    sliderId = $slider.data('id'),
                    data = {
                        x : parseFloat($slider[0].style.left) ,
                        y : parseFloat($slider[0].style.top)
                    }
                sliderDataset[sliderId] = data;
            })
            return sliderDataset;
        },
        resetPosition : function (container) {
            var $sliders = $('.step', container);
            _.each($sliders, function (slider) {
                var $slider = $(slider),
                    calcX = $slider.data('calcx'),
                    calcY = $slider.data('calcy');

                $(slider).data('x', calcX);
                $(slider).data('y', calcY);
                $(slider).css({
                    top : (calcY + 'px'),
                    left : (calcX + 'px')
                })
                console.log(calcX, calcY);

            })
        }
    }
    window.ImpressRender = module;
}());