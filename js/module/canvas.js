Core.registerModule("canvas",function(sb){
    var languages = localConfig.languages;
        curLanguage = window.navigator.language.toLocaleLowerCase().match(/zh/) ? languages['zh'] : languages['en'];
    var anim_name = {
            'none'      : curLanguage.anim_slider,
            "anim-scale":curLanguage.anim_sliderZoom,
            "anim-ySpin":curLanguage.anim_rotateLeft,
            "anim-xSpin":curLanguage.anim_rotateRight,
            "anim-rightRotate":curLanguage.anim_reverse
        },
        ANIMATION_LABEL  = curLanguage.anim_label,
        SCREEN_SIZE_MAP = {
            '16:9'  : {x:960,y:540},
            '8:5' : {x:960,y:600},
            '6:5'   : {x:600,y:500},
            '5:3'   : {x:600,y:360},
            '4:3'   : {x:800,y:600},
            '2:1'   : {x:1000,y:500},
            '1:1'   : {x:640,y:640}
        },
        DEFAULT_SLIDE_TYPE = 'impress',
        DEFAULT_SCREEN = '4:3',
        canvasX = 1200,
        canvasY = 600;

    var editor = null,newContainerFunc=null,data_number=0,item,viewY = 80,header=20,isEditor = false,
    sliders = new sb.ObjectLink(),currentSlider = null,slider_count = 0,slider_number = 0,
    createSliderFunc=null,addSliderElementFunc = null,addSliderObjectFunc = null,moveInter = -1,curKeycode = -1,
    SliderDataSet=new sb.ObjectLink(),zIndex_Number = 0,elementSet = new sb.ObjectLink(),editorContainer,
    eom=null,easm = null,eomTout=-1,target = null,elementOpertateFunc = null,cancelElementOperateMenuFunc =null,
    closeButton =null,easmCloseButton = null,setPositionFunc = null,showAnim = null,easmMove,
    copyElem = null,pasteElem=null,addImageFunc = null,addTextFunc = null,copyParams = null,eomItems = null,
    rgbSettingItems = null,defaultAtt,setSettingDefaultAttFunc,keyOperate,boxshadowsettingBut,boxshadowsetting,
    bgsettingBut,bordersettingBut,bgsetting,bordersetting,settingElements;

    var global = {},
        rightMenuBtn; //右键选中标志
    return {
        init : function() {

            global = this;
            //初始设置幻灯片的长宽
            var sMap = SCREEN_SIZE_MAP[DEFAULT_SCREEN];
            canvasX = sMap.x;
            canvasY = sMap.y;

            document.onselectstart =  function(){
                return false;
            }
            sb.container.oncontextmenu =  function(){
                return false;
            }
            // sb.container.style["marginTop"] = ((window.innerHeight-canvasY-viewY-header)/2+header)+"px";
            sb.data("mode", "editor");
            defaultAtt = {
                backgroundColor:"transparent",
                border:"none",
                borderColor:"rgb(0, 0, 0)",
                borderStyle:"none",
                borderWidth:"1px",
                borderBottomLeftRadius:"0%",
                borderTopLeftRadius:"0%",
                borderBottomRightRadius:"0%",
                borderTopRightRadius:"0%",
                boxShadow:"rgb(0, 0, 0) 0px 0px 10px inset",
                WebkitAnimation : "none",
                WebkitTransform : "rotate(0deg)",
                opacity:"1"
            };
            editorContainer = sb.find(".container");
            sb.css(editorContainer,{
                width: canvasX + "px",
                height: canvasY + "px"
            });
            eom = sb.find("#element-operate-menu");
            eomItems = sb.query(".elem-item", eom);
            // sb.move(eom, eom);
            easm = sb.find("#element-attrSetting-menu");
            easmMove = sb.query(".move", easm)[0];
            sb.css(easmMove,{
                height:"20px",
                width:"100%",
                top:"0px",
                left:"0px"
            });
            sb.move(easmMove,easm);
            rgbSettingItems = sb.query(".rgbcolor",easm);
            bgsetting = sb.find(".bgsetting",easm); 
            bordersetting = sb.find(".bordersetting",easm);
            boxshadowsetting = sb.find(".boxshadowsetting",easm);
            bgsettingBut = sb.find(".bgsetting-but",easm); 
            bordersettingBut = sb.find(".bordersetting-but",easm);
            boxshadowsettingBut = sb.find(".boxshadowsetting-but",easm);
            sb.bind(bgsettingBut, "click", function(){
                $('.attr-setting-panel').css('display', 'none');
                $('.setting-tag').removeClass('text-focus');
                $('.bgsetting').css('display', 'block');
                $('.bgsetting-but').addClass('text-focus');
            });
            sb.bind(bordersettingBut, "click", function(){
                $('.attr-setting-panel').css('display', 'none')
                $('.setting-tag').removeClass('text-focus');
                $('.bordersetting').css('display', 'block');
                $('.bordersetting-but').addClass('text-focus');
            });
            sb.bind(boxshadowsettingBut, "click", function(){
                $('.attr-setting-panel').css('display', 'none');
                $('.setting-tag').removeClass('text-focus');
                $('.boxshadowsetting').css('display', 'block');
                $('.boxshadowsetting-but').addClass('text-focus');
            });
            $('.transformsetting-but').on("click", function(){
                $('.attr-setting-panel').css('display', 'none');
                $('.setting-tag').removeClass('text-focus');
                $('.transformsetting').css('display', 'block');
                $('.transformsetting-but').addClass('text-focus');
            });
            settingElements = sb.query(".setting-element",easm);
            for (var i = 0,item; item =  settingElements[i]; i++) {
                var inputType =  item.getAttribute("data-input");
                var inputElem = sb.find(".value-input",item);
                var tar,parent,event,value,type,tarElem,pnumber;
                switch(inputType){
                    case 'checkbox':
                        inputElem.onchange = function(e){
                            if(!target||!elementSet[target]) {
                                tarElem = sliders[currentSlider];
                            }else{
                                tarElem = elementSet[target]["container"];
                            }
                            tar = e.currentTarget;
                            parent = tar.parentNode;
                            event = parent.getAttribute("data-event");
                            type = parent.getAttribute("data-type");
                            value = tarElem.style[type];
                            if(!tar.checked||!value) value = parent.getAttribute("data-param");
                            sb.notify({
                                type:event,
                                data:{
                                    key:type,
                                    value:value
                                }
                            });
                        };
                        break;
                        item.getAttribute("data-type");
                    case 'range':
                        inputElem.onchange = function(e){
                            tar = e.currentTarget;
                            parent = tar.parentNode;
                            event = parent.getAttribute("data-event");
                            type = parent.getAttribute("data-type");
                            pnumber =  parent.dataset.number;
                            var factor = parent.getAttribute("data-factor"),
                            unit = parent.getAttribute("data-unit");
                            var multi = parent.dataset.multi || '1';

                            value = tar.value/parseInt(factor)*parseInt(multi) + unit;

                            if(pnumber) {
                                var arr = defaultAtt[type].split(" ");
                                arr[pnumber] = value;
                                value = arr.join(" ");
                            }
                            sb.notify({
                                type:event,
                                data:{
                                    key:type,
                                    value:value
                                }
                            });
                        };
                        break;
                    case 'select':
                        inputElem.onchange = function(e){
                            tar = e.currentTarget;
                            parent = tar.parentNode;
                            event = parent.getAttribute("data-event");
                            type = parent.getAttribute("data-type");
                            value = tar.value;
                            sb.notify({
                                type:event,
                                data:{
                                    key:type,
                                    value:value
                                }
                            });
                        };
                        break; 
                    default:
                        break;
                }
            }
            closeButton = sb.find(".close-menu", eom);
            easmCloseButton = sb.find(".close-menu", easm);
            newContainerFunc = this.createElementContainer;
            createSliderFunc = this.createSlider;
            addSliderElementFunc = this.addSliderElement;
            addSliderObjectFunc = this.addSliderObject;
            elementOpertateFunc = this.elementOpertate;
            addImageFunc = this.addImage;
            addTextFunc = this.addText;
            cancelElementOperateMenuFunc = this.cancelElementOperateMenu;
            setPositionFunc = this.setPosition;
            setSettingDefaultAttFunc = this.setSettingDefaultAtt;
            currentSlider = currentSlider || this.createSlider("append").id;
            editor = sliders[currentSlider];
            
            var showAnim = document.createElement("div"),
                showAnimContainer = document.createElement('div'),
                label = document.createElement('div'),
                $slideType = $(document.createElement("div"));

            $(showAnimContainer).append(label).append(showAnim).css({
                position : 'absolute',
                zIndex      : "2",
                left        : "-125px",
                top         : "0px"
            })
            $(label).addClass('showAnim-label').html(ANIMATION_LABEL);
            $(showAnim).addClass("showAnim").addClass("blue-block").addClass('animation-setting')
            .html(anim_name[$(editor).data("anim")])
            .attr('title', '幻灯片的过渡动画/左键点击修改')
            .css({
                width       : "120px"
            })
            // 
            var sliderTypeChoosebox = window.ChooseBox.create([
                    {key : 'impress',      value : 'impress'},
                    {key : 'slide',       value : 'slide'}
                ]);
            window.ChooseBox.hide(sliderTypeChoosebox);
            window.ChooseBox.listen(sliderTypeChoosebox, function (value) {
                window.ChooseBox.hide(sliderTypeChoosebox);
                $slideType.removeClass('on').html(value);
                global._slideType = value;
            });
            $(sliderTypeChoosebox).find('.close-menu').hide();
            
            $(document.body).append(sliderTypeChoosebox);
            global._slideType = DEFAULT_SLIDE_TYPE;
            $slideType.addClass("slideType").addClass("blue-block").html(DEFAULT_SLIDE_TYPE)
            .css({
                position : 'absolute',
                backgroundColor : '#CCC',
                width       : "120px",
                zIndex      : "2",
                left        : "-125px",
                top         : "110px"
            })
            .attr('title', '幻灯片的播放类型/左键点击修改')
            .on('click', function (e) {
                if (window.ChooseBox.isHide(sliderTypeChoosebox)) {
                    $(this).addClass('on');
                    window.ChooseBox.show(sliderTypeChoosebox);
                    $(sliderTypeChoosebox).css({
                        top : e.clientY + 'px',
                        left : e.clientX + 'px'
                    });
                } else {
                    $(this).removeClass('on');
                    window.ChooseBox.hide(sliderTypeChoosebox);
                }
    
            });

            sb.move(showAnimContainer, showAnimContainer, {top : true});
            sb.move($slideType[0], $slideType[0], {top : true});

            $(editorContainer).append(showAnimContainer).append($slideType);
            sb.bind(window, "keydown",this.keyOperate);
            window.addEventListener("resize", function(){
                sb.notify({
                    type:"windowResize",
                    data:null
                });
            },false);

            closeButton.addEventListener("click", function(){
                cancelElementOperateMenuFunc();
            }, false);
            easmCloseButton.addEventListener("click", function(){
                easm.style.display = "none";
                
            }, false);
            //共享数据
            sb.data("sliderDataSet",SliderDataSet);
            sb.data("sliders",sliders);
            sb.listen({
                "onImportSlider" : this.readData,
                'loadTemplFile' : this.loadTemplFile,
                "enterEditorMode":this.enterEditorMode,
                "enterSaveFile":this.enterSaveFile,
                "addImage":this.addImage,
                "addVideo" : this.addVideo,
                "addText":this.addText,
                "addCode":this.addCode,
                "addSlider":this.createSlider,
                "changeSlider":this.changeSlider,
                "deleteSlider":this.deleteSlider,
                "insertSlider":this.insertSlider,
                "showOperateMenu":this.elementOpertate,
                "deleteElement":this.deleteElement,
                "moveToBottom":this.moveToBottom,
                "moveToTop":this.moveToTop,
                "moveDownward":this.moveDownward,
                "moveUpward":this.moveUpward,
                "copyElement":this.copyElement,
                "cutElement":this.cutElement,
                "pasteElement":this.pasteElement,
                "changeSliderAnim":this.changeSliderAnim,
                "elemAttrSetting":this.elemAttrSetting,
                "setStyleAttr":this.setStyleAttr,
                "changeShowAnim":this.changeShowAnim,
                "changeSliderStyle":this.changeSliderStyle,
                "windowResize":this.windowResize,
                "showFileSystem" : this.hideSliderEditor,
                "changeScreenScale" : this.changeScreenScale,
                'changeElemBackground' : this.changeElemBackground,
                "backgroundSetting" : this.backgroundSetting,
                "codeboxSetting" : this.codeboxSetting,
                "changeCodeType" : this.changeCodeType,
                "codeboxThemeSetting" : this.codeboxThemeSetting,
                "autoSaveTimer" : this.autoSaveTimer,
                "playSlider" :  this.playSlider
            });
            for (i = 0; item =  eomItems[i]; i++) {
                item.onclick = function(e){
                    if ( $(e.target).hasClass('menu-disabled') || $(e.target).parent().hasClass('menu-disabled') )  {
                        return;
                    }
                    var notify = e.currentTarget.getAttribute("data-event");
                    sb.notify({
                        type:notify,
                        data:e
                    }); 
                }
            }
            for (i = 0; item = rgbSettingItems[i]; i++) {
                item.onselectstart = function(){
                    return false;
                };
                var redSetting = sb.find(".red-setting",item),
                greenSetting = sb.find(".green-setting",item),
                blueSetting = sb.find(".blue-setting",item);
                var settings = [redSetting,greenSetting,blueSetting],k,setting;
                for (k = 0; setting = settings[k]; k++) {
                    sb.find(".value-input",setting).onchange = function(e){
                        var tar = e.currentTarget,ancestors = tar.parentNode.parentNode; 
                        var event = ancestors.getAttribute("data-event"),attrName,
                        attrValue,rPreviewValue,gPreviewValue,bPreviewValue,
                        dataCheck = ancestors.getAttribute("data-check"),
                        valueType=ancestors.getAttribute("data-type"),
                        redSetting = sb.find(".red-setting",ancestors),
                        greenSetting = sb.find(".green-setting",ancestors),
                        blueSetting = sb.find(".blue-setting",ancestors),
                        preview = sb.find(".color-preview",ancestors),
                        rPreview = sb.find(".preview",redSetting),
                        gPreview = sb.find(".preview",greenSetting),
                        bPreview = sb.find(".preview",blueSetting),
                        rvalue = Math.round(sb.find(".value-input",redSetting).value*255/100),
                        gvalue = Math.round(sb.find(".value-input",greenSetting).value*255/100),
                        bvalue = Math.round(sb.find(".value-input",blueSetting).value*255/100);
                        attrName = valueType;
                        attrValue = "rgb("+rvalue+", "+gvalue+", "+bvalue+")";
                        rPreviewValue = "rgb("+(rvalue||0)+", "+(0)+", "+(0)+")";
                        gPreviewValue = "rgb("+(0)+", "+(gvalue||0)+", "+(0)+")";
                        bPreviewValue = "rgb("+(0)+", "+(0)+", "+(bvalue||0)+")";
                        preview.style["backgroundColor"] = attrValue;
                        rPreview.style["backgroundColor"] = rPreviewValue;
                        gPreview.style["backgroundColor"] = gPreviewValue;
                        bPreview.style["backgroundColor"] = bPreviewValue;
                        if(dataCheck=="true"){
                            var isAllowChange = sb.find(".value-input",sb.find(".for-"+valueType,easm)).checked;
                            if(!isAllowChange) return;
                        }
                        if(valueType=="boxShadow"){
                            var darr = defaultAtt[valueType].split(" ");
                            var varr = attrValue.split(" ");
                            darr[0] = varr[0];
                            darr[1] = varr[1];
                            darr[2] = varr[2];
                            attrValue = darr.join(" ");
                        }
                        else if (valueType=="WebkitTransform") {
                            attrValue = defaultAtt[valueType].replace(/^rotate\(/,'').replace(/deg\)$/,'');
                        }
                        sb.notify({
                            type:event,
                            data:{
                                key:attrName,
                                value:attrValue
                            }
                        });
                    }
                }
            }

            global._imgSelector = ImageSelector.create(sb, function (dataUrl) {
                sb.notify({
                    type : "changeElemBackground",
                    data : dataUrl
                });
                // $(global._imgSelector).boxHide();
            }, function () {
                sb.notify({
                    type : "changeElemBackground",
                    data : 'initial'
                });
            })
            
            $(document.body).append(global._imgSelector);
            sb.move(global._imgSelector, global._imgSelector);
            $(global._imgSelector).boxHide();

            //代码输入框的代码高亮类型
            var choosebox = window.ChooseBox.create([
                    {key : 'C',         value : 'text/x-csrc'},
                    {key : 'C++',       value : 'text/x-c++src'},
                    {key : 'C#',        value : 'text/x-csharp'},
                    {key : 'Clojure',   value : 'text/x-clojure'},
                    {key : 'CSS',       value : 'text/css'},
                    {key : 'Java',      value : 'text/x-java'},
                    {key : 'Javascript',value : 'text/javascript'},
                    {key : 'XML/HTML',  value : 'text/html'},
                    {key : 'Shell',     value : 'text/x-sh'},
                    {key : 'SQL',       value : 'text/x-sql'},
                    {key : 'Python',    value : 'text/x-python'},
                    {key : 'Ruby',      value : 'text/x-ruby'},
                    {key : 'PHP',       value : 'application/x-httpd-php'},
                    {key : 'Erlang',    value : 'text/x-erlang'},
                    {key : 'Velocity',  value : 'text/velocity'},
                    {key : 'VB',        value : 'text/vbscript'}
                ]);
            //初始隐藏
            window.ChooseBox.hide(choosebox);
            window.ChooseBox.listen(choosebox, function (value) {
                sb.notify({
                    type : 'changeCodeType',
                    data : {
                        key : 'mode',
                        value : value
                    }
                })
                window.ChooseBox.hide(choosebox);
            });
            $(document.body).append(choosebox);
            sb.move(choosebox, choosebox);
            global._choosebox = choosebox;

            //代码输入框主题
            var chooseThemebox = window.ChooseBox.create([
                    {key : 'default',         value : 'default'},
                    {key : 'blackboard',      value : 'blackboard'},
                    {key : 'cobalt',          value : 'cobalt'},
                    {key : 'eclipse',         value : 'eclipse'},
                    {key : 'elegant',         value : 'elegant'},
                    {key : 'erlang-dark',     value : 'erlang-dark'},
                    {key : 'monokai',         value : 'monokai'},
                    {key : 'lesser-dark',     value : 'lesser-dark'},
                    {key : 'neat',            value : 'neat'},
                    {key : 'night',           value : 'night'},
                    {key : 'rubyblue',        value : 'rubyblue'},
                    {key : 'xq-dark',         value : 'xq-dark'},
                    {key : 'twilight',        value : 'twilight'},
                    {key : 'vibrant-ink',     value : 'vibrant-ink'}
                ]);
            //初始隐藏
            window.ChooseBox.hide(chooseThemebox);
            window.ChooseBox.listen(chooseThemebox, function (value) {
                sb.notify({
                    type : 'changeCodeType',
                    data : {
                        key : 'theme',
                        value : value
                    }
                })
                window.ChooseBox.hide(chooseThemebox);
            });
            $(document.body).append(chooseThemebox);
            sb.move(chooseThemebox, chooseThemebox);
            global._chooseThemebox = chooseThemebox;
            //窗口关闭前的保存文件操作
            window.onbeforeunload = function () {
                return '要离开正在编辑的内容？'
            }
            $('#previewContainer').find('.close-menu').on('click', function () {
                global._playFrame && $(global._playFrame).remove();
                $('#previewContainer').addClass('dp-none');
                $('#appContainer').removeClass('dp-none');
            })
        },
        //预览
        playSlider : function () {
            global._createSaveData(function (playHtml) {
                var $previewContainer = $('#previewContainer'),
                    iframe = document.createElement('iframe'),
                    $appContainer = $('#appContainer');
                    iframe.src= 'about:_blank';
                    iframe.id = 'preview-frame';
                    $(iframe).on('load', function () {
                        var doc = iframe.contentWindow.document;
                        doc.write(playHtml);
                        iframe.contentWindow.focus();
                    })
                    global._playFrame = iframe;
                    $previewContainer.append(iframe).removeClass('dp-none');
                    $appContainer.addClass('dp-none');

            })
        },
        // 定时保存
        autoSaveTimer : function () {
            console.log('setTimer');
            //一个定时器定时保存文件
            window.setInterval( global.saveTempFile, 1000*5);
        },
        _hideChooseBox : function () {
            window.ChooseBox.hide(global._choosebox);
            window.ChooseBox.hide(global._chooseThemebox);
        },
        backgroundSetting : function () {
            $(global._imgSelector).boxShow();
        },
        /**
        *   显示编码语言选择框
        **/
        codeboxSetting : function () {
            global.cancelElementOperateMenu();
            ChooseBox.show(global._choosebox);
        },
        codeboxThemeSetting : function () {
            global.cancelElementOperateMenu();
            ChooseBox.show(global._chooseThemebox);
        },
        changeElemBackground : function (dataUrl) {
            if (!rightMenuBtn || !dataUrl) return;
            if (rightMenuBtn === 'panel') {
                sb.notify({
                    type : "changeSliderStyle",
                    data : {
                        key : 'backgroundImage',
                        value : dataUrl
                    }
                });
            } else {
                sb.notify({
                    type : "setStyleAttr",
                    data : {
                        key : "backgroundImage",
                        value : dataUrl
                    }
                })
                // var tar = SliderDataSet[currentSlider][rightMenuBtn];
                // console.log(tar);
                // tar && $(tar.container).css('backgroundImage', dataUrl);
            }
        },
        changeCodeType : function (param) {
            if (!rightMenuBtn || rightMenuBtn === 'panel') return;
            var tarData = SliderDataSet[currentSlider][rightMenuBtn];
            if (tarData.data.tagName !== 'CODE') return;
            var codeMirror = tarData.file;
            codeMirror.setOption(param.key, param.value)

        },
        changeScreenScale : function (value) {
            var sMap;
            sMap = SCREEN_SIZE_MAP[value];
            if (!sMap) {
                // throw new Error('Unmatched screen size');
                sMap = SCREEN_SIZE_MAP[DEFAULT_SCREEN];
            }
            canvasX = sMap.x;
            canvasY = sMap.y;
            //更新幻灯片size
            global.refreshScreesSize();
        },
        refreshScreesSize : function () {
            $('.container', sb.container).css('height', canvasY + 'px').css('width', canvasX + 'px')
        },
        //以一种非常恶心的hack手段去删除slider列表
        removeSliderByArray : function (rmArray) {
            _.each(rmArray , function (item) {
                var idNum = item.key.replace(/[a-z]*/g, '');
                sb.notify({
                    type : 'deleteSlider',
                    data : idNum
                })
            });
            var showSliderNum = sliders.getFirstElement().replace(/[a-z]*/g, '')
            sb.notify({
                type : "changeSlider",
                data : showSliderNum
            });
            sb.notify({
                type : "changeFrame",
                data : 'frame' + showSliderNum
            })
            $('#view').show();
        },
        renderSlider : function (data) {

            var importData = JSON.parse(data),
                slidersData = JSON.parse(importData.cntData),
                slidersConf = importData.cntConf,
                sliderArray = readAsArray(slidersData),
                rmArray = sliders.toArray();
            //计算比例数
            var proportionArr = sb.reduce(parseInt(slidersConf.width), parseInt(slidersConf.height));
            //更改屏幕大小
            sb.notify({
                type : 'changeScreenScale',
                data : proportionArr.join(':') 
            })
            render(sliderArray);
            global.removeSliderByArray(rmArray);
            function readAsArray(data) {
                var sliders = [];
                    // imgCount = 0;
                for(var s in data){
                    if ( data.hasOwnProperty(s) ) {
                        var elementArray = [];
                        var elements = data[s].element;
                        for (var e in elements) {
                            if(elements.hasOwnProperty(e)){
                                elementArray.push(elements[e]);
                                // if (elements[e].type === 'IMG') imgCount ++;
                            }
                        }
                        sliders.push({
                            data : data[s],
                            elements : elementArray
                            // imgCount : imgCount
                        });
                    }
                }
                return sliders;
            }

            function render(array) {
                var slider = array.shift();
                if (slider) {
                    renderElements(slider);
                    render(array);
                }
            }
            
            function renderElements (slider, callback) {
                var elements = slider.elements;

                createSliderFunc('append', {
                    attr : slider.data['panelAttr'], 
                    anim : slider.data['anim']
                });

                sb.notify({
                    type:"importSlider",
                    data: 'append'
                });
                var count = 0;
                for (var i = 0; i < elements.length; i++) {
                    var data = elements[i],elem;
                    if(data.type === "DIV"){
                        sb.notify({
                            type:"addText",
                            data: {
                                paste : true,
                                attr : data.cAttr,
                                elemAttr : data.eAttr,
                                value : decodeURIComponent(data.value)
                            }
                        });
                    }
                    else if(data.type === "IMG") {
                        sb.notify({
                            type:"addImage",
                            data: {
                                paste : true,
                                attr : data.cAttr,
                                elemAttr : data.eAttr,
                                pAttr : data.panelAtt,
                                value : data.value
                            }
                        });
                    } 
                    else if (data.type === "VIDEO") {
                        global._addVideElement(data.value, {
                            isPaste : true,
                            eAttr : data.eAttr,
                            cAttr : data.cAttr,
                            value : data.value
                        })
                    }
                    if(data.type === "CODE"){
                        sb.notify({
                            type:"addCode",
                            data: {
                                paste : true,
                                attr : data.cAttr,
                                elemAttr : data.eAttr,
                                value : data.value,
                                theme : data.theme,
                                codeType : data.codeType
                            }
                        });
                    }
                }
            }
        },
        readData:function (inp) {

            var reader = new FileReader();
            var file = inp.files.item(0);

            reader.readAsText(file, 'UTF-8');
            reader.onloadend = function (event) {
                // var datajson = reader.result.match(/\<script\ type\=\"text\/html\"\ id\=\"datajson\"\>.*\<\/script\>/);
                var datajson = reader.result.match(/\<\!\-\-\[DATA_JSON_BEGIN\]\-\-\>.*\<\!\-\-\[DATA_JSON_END\]\-\-\>/);
                if (datajson) {
                   var data =  datajson[0]
                                .replace(/^\<\!\-\-\[DATA_JSON_BEGIN\]\-\-\>/,'')
                                .replace(/\<\!\-\-\[DATA_JSON_END\]\-\-\>/,'')
                                .replace(/^\<script[^\<\>]*\>/,'')
                                .replace(/\<\/script\>/,'');
                   console.log(data);
                    global.renderSlider(data);
                } 

            }
        },
        //恢复缓存文件
        loadTemplFile : function (data) {
            global.renderSlider(data);
        },
        destroy:function(){
            editor=null;
        },
        windowResize:function(){
            // sb.container.style["marginTop"] = ((window.innerHeight-canvasY-viewY-header)/2+header)+"px";
        },
        keyOperate:function(event){
            if(isEditor) return;
            if(!elementSet[target]){
                if(event.keyCode ==37||event.keyCode ==39){
                    var preSlider = sliders.getSlider(event.keyCode ==37?"pre":"next", currentSlider, -1);
                    preSlider = preSlider||currentSlider;
                    var number = preSlider.substring("slider".length,preSlider.length);
                    sb.notify({
                        type:"changeSlider",
                        data:number
                    });
                    sb.notify({
                        type:"changeFrame",
                        data:"frame"+number
                    });
                    return;
                }
            }
            // if(event.keyCode ==49){
            //     event.preventDefault();
            //     sb.notify({
            //         type:"enterSaveFile",
            //         data:null
            //     });
            // }else if(event.keyCode ==50){
            //     event.preventDefault();
            //     sb.notify({
            //         type:"addSlider",
            //         data:"append"
            //     });
            // }else if(event.keyCode ==51){
            //     event.preventDefault();
            //     sb.notify({
            //         type:"insertSlider",
            //         data:null
            //     });
            // }
            var tar,style,offset = 1;
            if(!(tar =elementSet[target])) return;
            style = tar.container.style;
            var oralT = sb.subPX(style["top"]),oralL = sb.subPX(style["left"]);
            if(event.keyCode ==37) {
                style["left"] = (oralL-offset)+"px";
            }
            else if(event.keyCode==39) {
                style["left"] = (oralL+offset)+"px";
            }
            else if(event.keyCode ==38){
                style["top"] = (oralT-offset)+"px";
            }
            else if(event.keyCode ==40){
                style["top"] = (oralT+offset)+"px";
            }else if(event.keyCode ==27){
                sb.removeClass(elementSet[target].container,"element-select");
                var parts = sb.query(".element-container-apart", elementSet[target].container);
                for (var i = 0; i < parts.length; i++) {
                    sb.removeClass(parts[i],"show-container-apart");
                }
                cancelElementOperateMenuFunc();
                easm.style.display = "none";
                target = null;
                return;
            }
        },
        enterEditorMode:function(){
            window.location.hash = ''
            sb.container.style.display = "block";
            sb.bind(window, "keyup",keyOperate);
            sb.notify({
                type:"showStyleBar",
                data:null
            });
        },
        _createThumb : function (sliderIndex, callback) {

            var renderElement = sliders[sliderIndex],
                curSlider = sliders[currentSlider];
            if ( sliderIndex !== currentSlider ) {
                renderElement.style.display = 'block';
                curSlider.style.display = 'none';
            }

            html2canvas( [ renderElement ], {
                onrendered: function(canvas) {
                    if ( sliderIndex !== currentSlider ) {
                        renderElement.style.display = 'none'
                        curSlider.style.display = 'block';
                    }
                    callback && callback(canvas.toDataURL());
                }
            });
        },

        _createSliderJSONData : function () {
            var json = new sb.ObjectLink(),
                isHasCode  = false;

            SliderDataSet.forEach(function(datasets, sliderIndex){
                var data = new sb.ObjectLink();
                var slider = {};
                datasets.forEach(function(b, n){
                    var sliderElement = {};
                    sliderElement.type = b["data"].tagName;
                    sliderElement.cAttr = b["container"].getAttribute("style");
                    sliderElement.eAttr = b["data"].getAttribute("style");
                    sliderElement.zIndex = b["zIndex"];
                    //img.src||video-srouce.src||textbox.src
                    sliderElement.value = b["data"].src || $(b["data"]).find('.video-source').attr('src') || encodeURIComponent(b["data"].innerHTML);
                    if(sliderElement.type=="IMG"){
                        sliderElement.panelAtt = sb.find(".element-panel",b["container"]).getAttribute("style");
                    }
                    if (sliderElement.type === 'CODE') {
                        isHasCode = true;
                        //code mirror
                        var doc =  b['file'].getDoc();
                        sliderElement.value = doc.getValue();
                        sliderElement.codeType = doc.getMode().name;
                        sliderElement.theme = b['file'].getOption('theme');
                    }
                    data[n] = sliderElement;
                });
                slider["anim"] = sliders[sliderIndex].getAttribute("data-anim");
                slider["panelAttr"] = sb.find(".panel", sliders[sliderIndex]).getAttribute("style");
                slider["element"] = data;
                json[sliderIndex] = slider;
            });
            return {
                data : json,
                isHasCode : isHasCode
            }
        },

        _createSaveData : function (callback) {
            global._createThumb(sliders.getFirstElement(), function (thumb) {
                var sliderJson = global._createSliderJSONData(),
                    count = 0,
                    slideType = global._slideType || DEFAULT_SLIDE_TYPE,
                    datas;
                datas = {
                    cntConf : {
                        'height' : editorContainer.style.height,
                        'width' : editorContainer.style.width,
                        'thumb' : thumb     //缩略图
                    },
                    cntData : sliderJson.data.toJSONString()
                }
                var scriptBegin = '<script type="text/javascript">',
                    scriptEnd   = '</script>',
                    styleBegin  = '<style type="text/css">',
                    styleEnd    = '</style>',
                    stream      = JSON.stringify(datas),
                    header      = window._sourceMap.header,
                    footer      = window._sourceMap.footer,
                    blogHeader          = window._sourceMap.blogHeader,
                    blogFooter          = window._sourceMap.blogFooter,
                    impressHeader       = window._sourceMap.impressHeader,
                    impressFooter       = window._sourceMap.impressFooter,
                    impressReader       = window._sourceMap.impressReader,
                    cmJS        = window._sourceMap.cmJS,
                    cmThemeJS   = window._sourceMap.cmThemeJS,
                    cmCss       = window._sourceMap.cmCSS,
                    cmThemeCSS  = window._sourceMap.cmThemeCSS,
                    animation   = window._sourceMap.animationCSS,
                    drawJS      = window._sourceMap.drawJS, //画板（用作批注）
                    zepto       = window._sourceMap.zepto, 
                    impressCSS  = window._sourceMap.impressCSS, 
                    impressJS   = window._sourceMap.impressJS, 
                    dataJsonMarkBegin   = '<!--[DATA_JSON_BEGIN]-->', 
                    dataJsonMarkEnd     = '<!--[DATA_JSON_END]-->';

                

                var dataHtml = dataJsonMarkBegin + '<script type="text/html" id="datajson">' 
                                + stream + scriptEnd + dataJsonMarkEnd,
                    combHTML;

                if (slideType === 'impress') {
                    header = impressHeader, footer = impressFooter;
                }
                //包含了高亮代码输入框
                if (sliderJson.isHasCode) {
                    header += styleBegin + cmCss + styleEnd +
                                styleBegin + cmThemeCSS + styleEnd +
                                scriptBegin + cmJS + scriptEnd + 
                                scriptBegin + cmThemeJS + scriptEnd;
                }
                switch (slideType) {
                    case 'impress' :
                    
                    combHTML =  header + 
                                styleBegin + animation + styleEnd +
                                dataHtml +
                                styleBegin + impressCSS + styleEnd +
                                scriptBegin + impressJS + scriptEnd +
                                scriptBegin + zepto + scriptEnd +
                                scriptBegin + impressReader + scriptEnd +
                                footer;
                    break; 
                    case 'blog' :; 
                    case 'slide' :

                    combHTML =  header +
                                styleBegin + animation + styleEnd +
                                dataHtml +
                                scriptBegin + zepto + scriptEnd +
                                scriptBegin + drawJS + scriptEnd +
                                footer;
                    break; 
                }
                // if (isImpressSlider) {
                    
                // }
                // else if (sliderJson.isHasCode) {  //按需添加代码片段
                //     combHTML =  header +
                //                 styleBegin + cmCss + cmThemeCSS + animation + styleEnd +
                //                 dataHtml +
                //                 scriptBegin + cmJS + cmThemeJS + scriptEnd +
                //                 scriptBegin + zepto + scriptEnd +
                //                 scriptBegin + drawJS + scriptEnd +
                //                 footer
                // } else { //不需要添加codemirror的代码
                //     combHTML =  header +
                //                 styleBegin + animation + styleEnd +
                //                 dataHtml +
                //                 scriptBegin + zepto + scriptEnd +
                //                 scriptBegin + drawJS + scriptEnd +
                //                 footer
                // }
                callback && callback(combHTML)
                
            });
        },
        enterSaveFile:function(){
            global._createSaveData(function (data) {
                sb.notify({
                    type : 'preSave',
                    data : data
                })
            });
        },
        //缓存文件
        saveTempFile : function () {
            var dataJson = global._createSliderJSONData(),
                datas = {
                    cntConf : {
                        'height' : editorContainer.style.height,
                        'width' : editorContainer.style.width,
                    },
                    cntData : dataJson.data.toJSONString()
                }
            sb.notify({
                    type : "beforeCloseSave",
                    data :  JSON.stringify(datas)
            });
        },
        hideSliderEditor : function () {
            sb.unbind(window, "keyup", keyOperate);
            sb.container.style.display = "none";
            $(global._imgSelector).boxHide();
            sb.notify({
                type:"hiddenStyleBar",
                data:null
            });
        },
        insertSlider:function(){
            createSliderFunc("insert", currentSlider);
        },
        //新添加：sliderId
        deleteSlider : function(delId){
            delId = !_.isEmpty(delId) ? 'slider' + delId : delId;
            var tarSlider = delId || currentSlider,
                oralCur = currentSlider,
                preSlider = sliders.getSlider("pre", tarSlider, -1) ||
                                sliders.getSlider("next", tarSlider, -1);

            oralCur && ( sliders[oralCur].style.display = "none");
            if(tarSlider){
                //删除slider DOM 元素
                editorContainer.removeChild(sliders[tarSlider]);
                delete sliders[tarSlider];
                delete SliderDataSet[tarSlider]
                
                currentSlider = preSlider;
            }
            //如果之前显示的元素为显示，那么就隐藏它
            
            //显示可能被隐藏的前slider
            if(preSlider&&sliders[preSlider]) sliders[preSlider].style.display = "block";
            else {
                //如果前slider不存在，那么就创建新的
                createSliderFunc("append");
            }


        },
        createSlider:function(method, pasteObj){
            var opDataId = null;
            if (  method && ( typeof(method) === 'object' ) ) {
                var param = method;
                method = param.method;
                opDataId = 'slider' + param.dataId;
            }
            var newSlider = document.createElement("div");
            var panel = document.createElement("div");

            if (pasteObj) {
                panel.setAttribute("style", pasteObj.attr);
                newSlider.setAttribute("data-anim", pasteObj.anim);
            } else {
                panel.setAttribute("style", "width:100%;height:100%;position:absolute;left:0;top:0;background-size:99.99% 100%;background-position:center;");
                newSlider.setAttribute("data-anim", "none");
            }
            
            panel.className = "panel";
            //左键点击取消选中
            elementOpertateFunc("panel",panel);
            newSlider.appendChild(panel);
            newSlider.className = "editor";
            newSlider.zIndex = 1;


            if(currentSlider) sliders[currentSlider].style.display = "none";
            
            slider_number++;
            slider_count++;

            var sliderID = "slider" + slider_number; 

            if(method == "insert"){
                var curElemId = opDataId || currentSlider;
                addSliderObjectFunc({
                    key : sliderID,
                    value : newSlider
                }, method, curElemId);
                addSliderElementFunc(newSlider, method, sliders[curElemId], editorContainer);

            } else if(method == "append"){

                addSliderObjectFunc({
                    key:sliderID,
                    value:newSlider
                },method,null);
                addSliderElementFunc(newSlider, method, null, editorContainer);
            }
            currentSlider = sliderID;
            editor = sliders[currentSlider];
            sb.notify({
                type : "changeShowAnim",
                data : editor.getAttribute("data-anim")
            });
            return {
                id:sliderID,
                slider:newSlider
            };
        },
        addSliderObject:function(slider,method,pos){
            if(method=="insert") {
                SliderDataSet.insert({
                    key:slider.key,
                    value:new sb.ObjectLink()
                },"before",pos);
                sliders.insert(slider,"before",pos);
            }
            else if(method=="append") {
                SliderDataSet[slider.key] = new sb.ObjectLink();
                sliders[slider.key] = slider.value;
            }
            else Core.log("wrong insert slider method!");
        },
        addSliderElement:function(elem,method,pos,container){
            if(method=="insert") container.insertBefore(elem, pos);
            else if(method=="append") container.appendChild(elem);
            else Core.log("wrong insert slider-Element method!");
        },
        _addVideoConfig : function  (container, video, options) {
                video.setAttribute("draggable", false);
                $(video).addClass('normalelement');
                var partSize = 6,
                    dataID;
                // sb.move(container, container);

                if (options && options.isPaste) { //元素粘贴
                    $(container).attr('style', options.cAttr);
                } 
                else 
                    $(container).attr("style", "position:absolute;z-index:1;left:0px;top:0px;");
                container.appendChild(video);
                editor.appendChild(container);
                var dataID = global._insetIntoDataset(container, video, null);
                elementOpertateFunc(dataID, container, container);
                return dataID;
        },
        _addVideElement : function (dataUrl, options) {
            var video = document.createElement('video');
                src = document.createElement('source');
                preCont = document.createElement('div'),
                isPaste = options && options.isPaste;
            $(video).attr('controls', true).append(src);
            $(src).attr('type','video/mp4').attr('src', dataUrl).addClass('video-source');
            
            var dataId = global._addVideoConfig(preCont, video, options);
            $(video).on('loadedmetadata', function () {
                var sizeObj = {
                    height  : video.clientHeight,
                    width   : video.clientWidth
                    }
                    , partSize = 6
                    , con_obj=null
                    , type = null;
                
                sizeObj = sb.fixedImgSize(sizeObj,canvasX,canvasY);

                newContainerFunc(sizeObj, partSize, null, {
                    'container' : preCont,
                    'type' : type,
                    'isFixedSize' : !isPaste
                });
                video.style.height = '100%';
                video.style.width = '100%';
                options && options.callback && options.callback.call(global, dataId);
            })
        },
        addVideo : function (fileInp) {
            sb.readFileData(fileInp, global._addVideElement);
        },
        addImage:function(obj, callback){
            var img = null,file;
            var preCont = document.createElement('div');
                editor.appendChild(preCont);

            //粘贴图片
            if(obj["paste"]) {
                img = new Image();
                img.src= obj["value"];
                file = null;
            }
            //添加图形
            else if (obj['shape']) {
                img = new Image();
                img.src= obj["value"];
                file = obj["value"];
            }
            //添加图片
            else {
                img = sb.addImage(obj);
                file = obj.files.item(0);
            }
            if(!img) {
                return;
            }
            var imgElementId = addImageConfig(preCont, img, obj);
            img.onload = function(){
                var sizeObj = {
                    height:img.height,
                    width:img.width
                };
                var partSize = 8,con_obj=null, type = obj.shape ? 'shape' : (obj.paste ? 'paste' : null)
                    sizeObj = sb.fixedImgSize(sizeObj,canvasX,canvasY);

                newContainerFunc(sizeObj,partSize, null, {
                    'container' : preCont,
                    'type' : type,
                    'isFixedSize' : !obj.paste
                });
                img.style.height = '100%';
                img.style.width = '100%';
                callback && callback(imgElementId)
            }

            function addImageConfig (container, img, obj) {
                img.setAttribute("draggable", false);
                img.className = "imgelement";

                var panel = document.createElement("div");
                panel.className = "element-panel";
                if (obj.pAttr) {
                    $(panel).attr('style', obj.pAttr);
                }
                else {
                    sb.css(panel, {
                        position:"absolute",
                        top:"0px",
                        left:"0px",
                        width:"100%",
                        height:"100%"
                    }); 
                }
                var partSize = 8,dataID,maxZIndexElem,maxZIndex,cur;

                sb.move(panel, container);

                if(obj["paste"]) {
                    container.setAttribute("style", obj["attr"]);
                    img.setAttribute('style', obj["elemAttr"]);
                }
                else {
                    container.setAttribute("style", "position:absolute;z-index:1;left:0px;top:0px;background-position:center;background-size:99.99% 100%;");
                }

                container.appendChild(img);
                container.appendChild(panel);
                editor.appendChild(container);

                var dataID = global._insetIntoDataset(container, img, file);
                elementOpertateFunc(dataID, container, container);
                return dataID;
            }

            return imgElementId;
        },
        addText:function(textObj){
            var obj = {
                height:50,
                width:300
            };
            var partSize = 8,dataID;
            var textBox = document.createElement("div");
            textBox.className = "textboxelement";
            var con_obj = newContainerFunc(obj, partSize,textBox);
            var container = con_obj.container;

            if(textObj["paste"]){
                container.setAttribute("style", textObj["attr"]);
                textBox.setAttribute("style", textObj["elemAttr"]);
                textBox.innerHTML = textObj["value"];
            }else{
                container.setAttribute("style", "position:absolute;left:"+((canvasX-obj.width)/2)+"px;top:"+((canvasY-obj.height)/2)+"px;");
                textBox.setAttribute("style", "height:"+obj.height+"px;width:"+obj.width+"px;overflow:hidden;outline: none;");
            }
            container.style.zIndex = global._getMaxZIndex(currentSlider);
            $(container).css({
                font : 'initial',
                color : 'initial',
                lineHeight : 'initial',
                letterSpacing : 'initial'
            });

            textBox.setAttribute("contenteditable", "true");
            container.appendChild(textBox);
            editor.appendChild(container);
            textBox.focus();
            isEditor = true;

            dataID = global._insetIntoDataset(container, textBox)
            elementOpertateFunc(dataID,con_obj.container,con_obj.container);

            // editorElem = textBox;
            document.onselectstart = function(){
                return true;
            }
            textBox.onfocus = function(e){
                document.onselectstart = function(){
                    return true;
                }
                global.setSelect(dataID);
                if(!isEditor) isEditor = true;
            }
            $(textBox).on('blur', function(e){
                document.onselectstart = function(){
                    return false;
                }
                isEditor = false;
            });
            //选中
            global.setSelect(dataID);
            return dataID;
        },

        addCode : function (pasteParam) {
            pasteParam || (pasteParam = {});

            var textArea = document.createElement('code'),
                codeWrap = document.createElement('code'),
                partSize = 8,
                defaultValue = '',
                defaultTheme = 'blackboard',
                defaultMode = '',
                containerDatas = newContainerFunc({
                    "height"  : 400,
                    "width"   : 500
                }, partSize, null, {
                    "isFixedSize" : true
                });
            $(textArea).attr("contenteditable", "true").css({
                height : "100%",
                width : "100%",
                position : 'relative'
            })
            $(codeWrap).css({
                height  : '100%',
                width   : '100%',
                position : 'absolute'
            }).addClass('normalelement');

            /*paste code*/
            if(pasteParam["paste"]){
                containerDatas.container.setAttribute("style", pasteParam["attr"]);
                codeWrap.setAttribute("style", pasteParam["elemAttr"]);
                defaultValue = pasteParam["value"];
                defaultTheme = pasteParam['theme'];
                defaultMode = pasteParam['codeType'];
            }
            /**********/
            codeWrap.appendChild(textArea)
            $(containerDatas.container).append(codeWrap);
            containerDatas.container.style.zIndex = global._getMaxZIndex(currentSlider);
            $(containerDatas.container).css({
                font : 'initial',
                color : 'initial',
                lineHeight : 'initial',
                letterSpacing : 'initial'
            });
            editor.appendChild(containerDatas.container)
            
            var codeMirror = CodeMirror(textArea, {
                                  value: defaultValue,
                                  mode:  defaultMode,
                                  theme : defaultTheme,
                                  lineNumbers  : true,
                                  lineWrapping  : true //长行换行，不滚动
                                });

            codeMirror.on('focus', function () {
                if(!isEditor) isEditor = true;
            });
            codeMirror.on('blur', function () {
                isEditor = false;
            });
    
            var dataId = global._insetIntoDataset(containerDatas.container, codeWrap, codeMirror);
            elementOpertateFunc(dataId, containerDatas.container, containerDatas.container);
            return dataId;
        },
        //添加svg矢量图
        addSvg : function () {
            //TODO
        },

        _getMaxZIndex : function (curSlider) {
            var cur = SliderDataSet[currentSlider];
            maxZIndexElemID = cur.getLastElement();
            return (maxZIndexElemID == null ? 1 : cur[maxZIndexElemID]["zIndex"] + 1);
        },
        _insetIntoDataset : function (container, subElem, file) {
            var dataID,
                maxZIndex;

            data_number ++;
            zIndex_Number ++;

            dataID = "data" + data_number; ///当前元素的序号

            maxZIndex = global._getMaxZIndex(currentSlider);

            container.style.zIndex = maxZIndex;

            elementSet[dataID] = {
                "container" : container,
                "data"      : subElem,
                "zIndex"    : maxZIndex,
                "file"      : file
            }

            SliderDataSet[currentSlider][dataID] = elementSet[dataID];
            SliderDataSet[currentSlider].sortBy("zIndex");
            
            return dataID;
        },
        elemAttrSetting:function(e){
            var tar;
            // eom.style.display = "none";
            global.cancelElementOperateMenu();
            easm.style.display = "block";
            setPositionFunc(e,easm,-100,-100,-300,-200);
            if(target && ( tar = elementSet[target])){
                tar = elementSet[target].container;
            }else{
                /*设置slider的属性*/
                tar = sb.find(".panel",editor);
            }
            for (var att in defaultAtt) {
                if(tar.style.hasOwnProperty(att)&&tar.style[att].length!=0){
                    defaultAtt[att] = tar.style[att];
                }
            }
            setSettingDefaultAttFunc();
        },
        setSettingDefaultAtt:function(){

            var i,
                type,
                pnumber,
                attrValue;

            for (i = 0;item =  rgbSettingItems[i];i++) {
                var redSetting = sb.find(".red-setting",item),
                    greenSetting = sb.find(".green-setting",item),
                    blueSetting = sb.find(".blue-setting",item),
                    preview = sb.find(".color-preview",item),
                    rPreview = sb.find(".preview",redSetting),
                    gPreview = sb.find(".preview",greenSetting),
                    bPreview = sb.find(".preview",blueSetting),
                    rgbArr;

                type = item.getAttribute("data-type");
                console.log('rightMenuBtn', rightMenuBtn);
                if (rightMenuBtn === 'panel') {
                    attrValue =   sliders[currentSlider].style[type] || defaultAtt[type];
                } else {
                    attrValue =   SliderDataSet[currentSlider][rightMenuBtn].container.style[type] || defaultAtt[type];
                }
                if(type=="boxShadow") {
                    var splitArr = defaultAtt[type].split(" ");
                    var rgbdivArr = [splitArr[0],splitArr[1],splitArr[2]];
                    rgbArr = sb.subrgb(rgbdivArr.join(" "));
                }else{
                    rgbArr = sb.subrgb(defaultAtt[type]);
                }
                if(rgbArr){
                    
                    var rv = Math.round(rgbArr[0]*100/255),
                    gv = Math.round(rgbArr[1]*100/255),
                    bv = Math.round(rgbArr[2]*100/255);
                    sb.find(".value-input",redSetting).value = rv;
                    sb.find(".value-input",greenSetting).value = gv;
                    sb.find(".value-input",blueSetting).value = bv;
                    rPreview.style["backgroundColor"]  = "rgb("+rgbArr[0]+","+0+","+0+")";
                    gPreview.style["backgroundColor"]  = "rgb("+0+","+rgbArr[1]+","+0+")";
                    bPreview.style["backgroundColor"]  = "rgb("+0+","+0+","+rgbArr[2]+")";
                    preview.style["backgroundColor"] = "rgb("+rgbArr[0]+","+rgbArr[1]+","+rgbArr[2]+")";
                }
            }
            for (i = 0,item; item =  settingElements[i]; i++) {
                var inputType =  item.dataset.input;
                var inputElem = sb.find(".value-input",item),
                param,value;
                switch(inputType){
                    case 'checkbox':
                        type = item.dataset.type;
                        value = defaultAtt[type];
                        param = item.dataset.param;
                        if(value===param) inputElem.checked = false;
                        else inputElem.checked = true;
                        break;
                    case 'range':
                        type = item.dataset.type;
                        pnumber = item.dataset.number;
                        var factor = item.dataset.factor,
                        unit = item.dataset.unit,
                        dvalue = defaultAtt[type];
                        if(pnumber) dvalue = dvalue.split(" ")[pnumber];
                        var multi = item.dataset.multi || '1';
                        inputElem.value = parseInt(dvalue)*factor/multi;
                        break;
                    case 'select':
                        type = item.dataset.type;
                        value = defaultAtt[type];
                        inputElem.value = value;
                        break; 
                    default:
                        break;
                }
            }
        },
        setStyleAttr:function(params){
            var key = params.key,value = params.value;
            defaultAtt[key] = value;

            var target = rightMenuBtn;

            if(target && elementSet[target]){
                var container = elementSet[target].container;
                var img,elemAtt = {
                    borderTopLeftRadius:true,
                    borderBottomLeftRadius:true,
                    borderTopRightRadius:true,
                    borderBottomRightRadius:true,
                    boxShadow:true,
                    opacity : true
                };

                if((img = sb.find("img",container))&&elemAtt[key]) {
                    sb.find(".element-panel",container).style[key] = value;
                    img.style[key] = value;
                } 
                else if (key === 'WebkitTransform') {
                    container.style[key] = 'rotate(' + value + 'deg)';
                }

                if (key === 'fontSize' && elementSet[target].data.tagName === 'CODE') {
                    elementSet[target].file.refresh();
                }
                if (key !== 'opacity' && key !== 'WebkitTransform') container.style[key] = value;
                if (key === 'borderWidth' && !container.style.borderStyle) container.style.borderStyle = 'solid';
            }else{
                var compatibleAtt = {
                    backgroundColor:true,
                    opacity:true,
                    boxShadow:true
                };
                /*提供设置slider属性的接口*/
                if(compatibleAtt[key]) {
                    sb.notify({
                        type:"changeSliderStyle",
                        data:{
                            key:key,
                            value:value
                        }
                    })
                }
            }
        },
        changeSliderStyle:function(data){
            sb.find(".panel",editor)["style"][data.key] = data.value;
        },
        moveUpward:function(){
            var target = rightMenuBtn;
            
            var cur = SliderDataSet[currentSlider];
            var maxElemID = cur.getLastElement(),tmp,forwardIndex = -1,forwardElemID,forwardElem,
            targetIndex;
            if(target && maxElemID !== target){
                targetIndex = cur.findIndex(target);
                forwardIndex = targetIndex+1;
                forwardElemID = cur.getSlider(null, null, forwardIndex);
                forwardElem = cur[forwardElemID];
                tmp = forwardElem["zIndex"];
                forwardElem["zIndex"] = cur[target]["zIndex"];
                cur[target]["zIndex"] = tmp;
                forwardElem["container"].style.zIndex = forwardElem["zIndex"];
                cur[target]["container"].style.zIndex = cur[target]["zIndex"];
                cur.sortBy("zIndex");
            }
        },
        moveDownward:function(){
            var target = rightMenuBtn;
            
            var cur = SliderDataSet[currentSlider];
            var minElemID = cur.getFirstElement(),tmp,backwardIndex = -1,backwardElemID,backwardElem,
            targetIndex;
            if(target && minElemID !== target){
                targetIndex = cur.findIndex(target);
                backwardIndex = targetIndex-1;
                backwardElemID = cur.getSlider(null, null, backwardIndex);
                backwardElem = cur[backwardElemID];
                tmp = backwardElem["zIndex"];
                backwardElem["zIndex"] = cur[target]["zIndex"];
                cur[target]["zIndex"] = tmp;
                backwardElem["container"].style.zIndex = backwardElem["zIndex"];
                cur[target]["container"].style.zIndex = cur[target]["zIndex"];
                cur.sortBy("zIndex");
            }
        },
        moveToTop:function(){
            var target = rightMenuBtn;

            var maxElemID = SliderDataSet[currentSlider].getLastElement(),maxZIndex = 0,maxElem;
            maxElem = SliderDataSet[currentSlider][maxElemID];
            maxZIndex = maxElem.zIndex+1;

            if(target && target!=maxElemID){
                SliderDataSet[currentSlider][target]["zIndex"] = maxZIndex;
                SliderDataSet[currentSlider][target]["container"].style.zIndex = maxZIndex;
                SliderDataSet[currentSlider].sortBy("zIndex");
            }
        },
        moveToBottom:function(){
            var target = rightMenuBtn;
            
            var minElemID = SliderDataSet[currentSlider].getFirstElement(),minZIndex = 0,minElem;
            minElem = SliderDataSet[currentSlider][minElemID];
            minZIndex = minElem.zIndex;
            if(target && target!=minElemID){
                SliderDataSet[currentSlider].forEach(function(a){
                    a["zIndex"]++;
                    a["container"].style.zIndex  = a["zIndex"];
                });
                SliderDataSet[currentSlider][target]["zIndex"] = minZIndex;
                SliderDataSet[currentSlider][target]["container"].style.zIndex = minZIndex;
                SliderDataSet[currentSlider].sortBy("zIndex");
            }
        },
        //元素的剪切
        cutElement : function () {
            sb.notify({
                type : 'copyElement',
                data : null
            })
            sb.notify({
                type : 'deleteElement',
                data : null
            })
        },
        deleteElement:function(){

            var globalTar = target;
            delTarget = rightMenuBtn;

            if(!delTarget) return;

            var elemNum = delTarget;
            if(elementSet[elemNum].container) sliders[currentSlider].removeChild(elementSet[elemNum].container);
            delete elementSet[elemNum];
            delete SliderDataSet[currentSlider][elemNum];
            eom.style.display = "none";

            //将左键选中的目标也删除
            if(globalTar == rightMenuBtn) {
                target = null;
            }
        },
        copyElement:function(){
            
            if(!rightMenuBtn) return;
            //右键选中复制目标
            copyElem = rightMenuBtn;

            if(copyElem&&elementSet[copyElem]){
                var pasteElem = elementSet[copyElem];
                var container = pasteElem.container,data = pasteElem.data,
                value = data.src || data.innerHTML;
                data.tagName === 'VIDEO' && ( value = $('.video-source', data).attr('src') );
                // data.tagName === 'CODE' && (value = pasteElem.file.getDoc().getValue());
                copyParams = {
                    paste   : true,
                    type    : data.tagName,
                    value   : value,
                    attr    : container.getAttribute("style"),
                    elemAttr: data.getAttribute("style"),
                    pAttr   : data.tagName === 'IMG' ? $(container).find('.element-panel').attr("style") : ''
                };
                if ( data.tagName === 'CODE' ) {
                    copyParams.value = pasteElem.file.getDoc().getValue();
                    copyParams.theme = pasteElem.file.getOption('theme');
                    copyParams.codeType  = pasteElem.file.getOption('mode');
                }
            }
        },
        pasteElement : function(){

            if(copyParams){
                //image
                if(copyParams["type"]=="IMG") {
                    addImageFunc(copyParams, function (imgElementId) {
                        global.setSelect(imgElementId);
                    });
                    
                }
                //textArea
                else if(copyParams["type"]=="DIV") {
                    var textElementId = addTextFunc(copyParams);
                    global.setSelect(textElementId);
                }
                //video
                else if (copyParams["type"] === 'VIDEO') {
                    global._addVideElement (copyParams.value, {
                        eAttr   : copyParams.elemAttr,
                        cAttr   : copyParams.attr,
                        isPaste : true,
                        type    : copyParams.type,
                        callback : function (dataId) {
                            global.setSelect(dataId);
                        }
                    });
                }
                //code textarea inputbox
                else if (copyParams["type"]=="CODE") {
                    var textElementId = global.addCode(copyParams);
                    global.setSelect(textElementId);
                }
                
            }
        },
        changeSlider:function(snum){
            var sliderID = "slider" + snum;
            if(!sliders[sliderID]) {
                Core.log("Slider is not exist!");
                return;
            }
            if(currentSlider&&sliders[currentSlider]){
                sliders[currentSlider].style.display = "none";
            }
            sliders[sliderID].style.display = "block";
            currentSlider = sliderID;
            editor = sliders[currentSlider];
            sb.notify({
                type : "changeShowAnim",
                data : editor.getAttribute("data-anim")
            });
            cancelElementOperateMenuFunc();
            easm.style.display = "none";
            if(target){
                sb.removeClass(elementSet[target].container,"element-select");
                var parts = sb.query(".element-container-apart", elementSet[target].container);
                for (var i = 0; i < parts.length; i++) {
                    sb.removeClass(parts[i],"show-container-apart");
                }
                target = null;
            }
        },
        //取消显示右键菜单
        cancelElementOperateMenu:function(){
            eom.style.display = "none";
            $(global._imgSelector).boxHide();
            global._hideChooseBox()
            // ChooseBox.hide(global._choosebox);
        },
        changeSliderAnim:function(newAnim){
            sliders[currentSlider].setAttribute("data-anim", newAnim);
            sb.notify({
                type:"changeShowAnim",
                data:newAnim
            });
        },
        changeShowAnim:function(anim){
            $('.animation-setting').html(anim_name[anim]);
        },
        setSelect : function (elemID) {

            if (!elemID || elemID === "panel" || target === elemID  ) return;
            //取消现有目标的效果
            if(target&&elementSet[target]) {
                sb.removeClass(elementSet[target].container,"element-select");
                var parts = sb.query(".element-container-apart", elementSet[target].container);
                for (i = 0; i < parts.length; i++) {
                    sb.removeClass(parts[i],"show-container-apart");
                }
            }
            // if (target === elemID) {
            //     target = null;
            //     return;
            // }
            target = elemID;
            var container = elementSet[target].container;
            sb.addClass(container, "element-select");
            var elements = sb.query(".element-container-apart", elementSet[target].container);
            for (i = 0; i < elements.length; i++) {
                sb.addClass(elements[i],"show-container-apart");
            }

        },
        elementOpertate:function(elemID,etar,container){
            var i;
            sb.click(etar, {isDown : false}, function (e) {
                    cancelRightMenu();
                    if ( target === elemID) return;
                    //取消现有目标的效果
                    if(target && elementSet[target]) {
                        sb.removeClass(elementSet[target].container,"element-select");
                        var parts = sb.query(".element-container-apart", elementSet[target].container);
                        for (i = 0; i < parts.length; i++) {
                            sb.removeClass(parts[i],"show-container-apart");
                        }
                    }
                    if (elemID === 'panel') {
                        target = null;
                        return;
                    }
                    target = elemID;
                    sb.addClass(container, "element-select");
                    var elements = sb.query(".element-container-apart", elementSet[target].container);
                    for (i = 0; i < elements.length; i++) {
                        sb.addClass(elements[i],"show-container-apart");
                    }
            })

            function cancelRightMenu () {
                cancelElementOperateMenuFunc();
                easm.style.display = "none";
                
            }
            sb.bind(etar,"mousedown",function(e){
                //监听鼠标右键
                if(e.button == 2){
                    //取消默认右键菜单
                    etar.oncontextmenu = function(){
                        return false;
                    }
                    //选择性显示菜单项
                    global._chooseMenuItem(elemID);

                    rightMenuBtn = elemID;
                    if(elemID == 'panel'){
                        //如果上次为面板触发右键，隐藏菜单
                        if(eom.style.display == "block"){
                            cancelElementOperateMenuFunc();
                            easm.style.display = "none";
                            return;
                        }
                        //面板触发右键，则没有选择目标
                        target=null;
                        eom.style.display = "block";
                        setPositionFunc(e,eom,-50,-50,-100,-200);
                        return;
                    }
                    eom.style.display = "block";
                    setPositionFunc(e, eom, -50, -50, -100, -200);
                    
                }
            });
        },
        _chooseMenuItem : function (elemId) {
            var $codeboxItem = $(".codebox-setting-item", eom),
                $textEditItem = $(".textedit-setting-item", eom),
                $zIndexItem = $(".zIndex-setting-item", eom),
                $elemItem   = $(".elem-setting-item", eom),
                $pasteItem   = $(".paste-menu-item", eom);


            var type = ( elemId === 'panel' ) ? 'panel' : SliderDataSet[currentSlider][elemId].data.tagName;
            $('.menu-detect-item').addClass('dp-none');
            //粘贴选项
            if (copyParams) {
                $pasteItem.removeClass('menu-disabled');
            }
            else {
                $pasteItem.addClass('menu-disabled');
            }

            if (type === 'panel') { //面板没有复制粘贴之类的操作
                $zIndexItem.addClass('menu-disabled')   
                $elemItem.addClass('menu-disabled')
            } else {
                $zIndexItem.removeClass('menu-disabled')
                $elemItem.removeClass('menu-disabled')
            }
            if (type === 'CODE') { //高亮代码工具菜单
                $codeboxItem.removeClass('dp-none');
            }
            else if (type === 'DIV'){ //文本框工具菜单
                $textEditItem.removeClass('dp-none');
            } 
        },
        setPosition:function(event,elem,x1,y1,x2,y2,show){
            var offsetX = event.screenX > (window.innerWidth + x2) ? x2 : x1,
                offsetY = (event.screenY  > window.innerHeight + y2) ? y2 : y1;
            elem.style.left = (event.screenX + offsetX) + "px";
            elem.style.top  = (event.screenY + offsetY) + "px";
        },

        createElementContainer:function(sizeObj, partSize, elem, options){

            /*
             * @names:
             *      con_e container : east
             *      con_w container : west
             *      con_s container : south
             *      con_n container : north
             */

            options = options || {};

            var container = options.container || document.createElement("div"),
                move_e = document.createElement("div"),
                move_w = document.createElement("div"),
                move_s = document.createElement("div"),
                move_n = document.createElement("div"),

                rotateCon = document.createElement("div"),
                rotateLeft = document.createElement("div"),
                rotateRight = document.createElement("div"),

                centerValue = '-webkit-calc(50% - ' + partSize/2 + 'px)'

                parts = {

                "con_e":{
                    className:"con-part-e",
                    resizeHandle:sb.proxy(sb.resizeRX, sb),
                    style:"right:"+(-partSize)+"px;top:" + centerValue + ";"
                },
                "con_w":{
                    className:"con-part-w",
                    resizeHandle:sb.proxy(sb.resizeLX, sb),
                    style:"left:"+(-partSize)+"px;top:" + centerValue + ";"
                },
                "con_s":{
                    className:"con-part-s",
                    resizeHandle:sb.proxy(sb.resizeBY, sb),
                    style: "bottom:"+(-partSize)+"px;left:" + centerValue + ";"
                },
                "con_n":{
                    className:"con-part-n",
                    resizeHandle:sb.proxy(sb.resizeTY, sb),
                    style:"top:"+(-partSize)+"px;left:" + centerValue + ";"
                },
                "con_se":{
                    className:"con-part-se",
                    resizeHandle:sb.proxy(sb.resizeRB, sb),
                    style:"bottom:"+(-partSize)+"px;right:"+(-partSize)+"px;"
                },
                "con_ne":{
                    className:"con-part-ne",
                    resizeHandle:sb.proxy(sb.resizeRT, sb),
                    style:"top:"+(-partSize)+"px;right:"+(-partSize)+"px;"
                },
                "con_sw":{
                    className:"con-part-sw",
                    resizeHandle:sb.proxy(sb.resizeLB, sb),
                    style:"bottom:"+(-partSize)+"px;left:"+(-partSize)+"px;"
                },
                "con_nw":{
                    className:"con-part-nw",
                    resizeHandle:sb.proxy(sb.resizeLT, sb),
                    style:"top:"+(-partSize)+"px;left:"+(-partSize)+"px;"
                }
            };
            container.style.WebkitTransformOrigin = 'center center';
            // $(container).attr('title', '左键点击选中/右键打开菜单')
            var frag = document.createDocumentFragment();
            
            for (var item in parts) {
                var element = sb.create("div");
                element.className = "element-container-apart " + parts[item].className;
                element.setAttribute("style", parts[item].style+"height:"+partSize+"px;width:"+partSize+"px;");
                parts[item].element = element;
                parts[item].resizeHandle([element,container,elem]);
                frag.appendChild(element);
            }
            if (!options.container) {

                container.setAttribute("style", "position:absolute;z-index:1;left:0px;top:0px;background-position:center;background-size:99.99% 100%;");
                //图形库的图形大小为图片本身大小
            }
            if (options['isFixedSize']) {
                container.style.height = sizeObj.height + 'px';
                container.style.width = sizeObj.width + 'px';
            }

            //边框移动控件
            $(move_e).addClass("element-container-apart-move con-move-e");
            $(move_w).addClass("element-container-apart-move con-move-w");
            $(move_s).addClass("element-container-apart-move con-move-s");
            $(move_n).addClass("element-container-apart-move con-move-n");

            //旋转控件
            $(rotateCon).addClass('con-rotate').append(rotateLeft).append(rotateRight).attr('title', '拖拽旋转');
            $(rotateLeft).addClass('con-rotate-elem con-rotate-left');
            $(rotateRight).addClass('con-rotate-elem con-rotate-right');

            //resize控件
            $(move_w).attr("style", "left:-6px;top:0;height:100%;width:6px;");
            $(move_e).attr("style", "right:-6px;top:0;height:100%;width:6px;");
            $(move_s).attr("style", "bottom:-6px;left:0;height:6px;width:100%;");
            $(move_n).attr("style", "top:-6px;left:0;height:6px;width:100%;");

            $(container)
                .addClass("element-container")
                .append(move_w)
                .append(move_e)
                .append(move_s)
                .append(move_n)
                .append(rotateCon)
                .append(frag)
                .attr("draggable", false);
            sb.move(move_w, container);
            sb.move(move_e, container);
            sb.move(move_s, container);
            sb.move(move_n, container);
            global._dragRotate(rotateCon, container)
            global._rotate(rotateLeft, container, 'left')
            global._rotate(rotateRight, container, 'right')

            return {
                container:container
            }
        },
        _dragRotate : function (rotateBtn, tar) {
            var initX=0,pInitW=0,
                flag={ isInit:false, isDown:false };

            sb.ondrag(rotateBtn, flag, function(event) {
                if(flag.isDown){
                    var clientX = event.screenX;
                    var clientY = event.screenY;
                    if(!flag.isInit) {

                        initX = clientX;
                        initY = clientY
                        flag.isInit = true;
                        var transform = $(tar).css('WebkitTransform');
                        initRoate = transform ? parseFloat( transform.replace(/^rotate\(/,'').replace(/deg\)$/,'') ) : 0;
                    } else {
                        //
                        initRoate = initRoate % 360;
                        var trFnValue = initRoate*Math.PI/180;
                        var diffResize = (clientX - initX) * Math.cos(trFnValue) + (clientY - initY) * Math.sin(trFnValue);
                        
                        initRoate += diffResize/100;
                        tar.style.WebkitTransform = 'rotate(' + initRoate + 'deg)';
                    }
                    
                }
            });
        },
        _rotate : function (rotateBtn, tar, forward) {
            $(rotateBtn).on('click', function () {
                var transform = $(tar).css('WebkitTransform');
                var rotateValue = transform ? parseFloat( transform.replace(/^rotate\(/,'').replace(/deg\)$/,'') ) : 0;
                if (forward === 'left') rotateValue = rotateValue - 1;
                else  rotateValue = rotateValue + 1;
                tar.style.WebkitTransform = 'rotate(' + rotateValue + 'deg)';
            })
        }
    };
});