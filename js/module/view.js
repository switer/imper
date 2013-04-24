Core.registerModule("view",function(sb){
    var frame_count = 0,frame_number = 0,VIEWSCALE=5, MAX_FRAME_NUMBER=10,
    frames = new sb.ObjectLink(),dispFrames = new sb.ObjectLink(),hidFrames = new sb.ObjectLink(),
    currentFrame = null,frameContainer = null,
    changeCurrFrameFunc = null,
    getElementDataFunc=null,showFrameElementByDataFunc=null;

    var SCREEN_SIZE_MAP = {
            '16:9'  : {x:160, y:90,     scale : 6 },
            '8:5'   : {x:160, y:100,    scale : 6 },
            '6:5'   : {x:120, y:100,    scale : 5 },
            '5:3'   : {x:150, y:90,     scale : 4 },
            '4:3'   : {x:160, y:120,    scale : 5 },
            '2:1'   : {x:160, y:80,     scale : 6.25 },
            '1:1'   : {x:160, y:160,    scale : 4 }
        },
        MAGIN_TOP_MAP = {
            '16:9'  : '10px',
            '8:5'   : '5px',
            '6:5'   : '5px',
            '5:3'   : '10px',
            '4:3'   : '-15px',
            '2:1'   : '0px',
            '1:1'   : '-50px'
        },
        DEFAULT_SCREEN = '4:3',
        FRAME_X = 160,
        FRAME_Y = 120,
        FRAME_SCALE_SIZE = 5,
        global,
        conf = {
            SCALE_SIZE : 0.5
        }
    return {
        init:function(){
            global = this;
            global._paramCache = {};
            frameContainer = sb.find("#frame-list");
            changeCurrFrameFunc = this.changeCurrFrame;
            changeDisplayFrameListFunc = this.changeDisplayFrameList;
            getElementDataFunc = this.getElementData;
            showFrameElementByDataFunc = this.showFrameElementByData;
            if(!currentFrame) this.addSlider("append");
            sb.listen({
                "deleteSlider":this.deleteFrame,
                "addSlider":this.addSlider,
                "importSlider":this.addSlider,
                // "showSlider":this.showFrame,
                "changeSliderStyle":this.changeSliderStyle,
                "changeFrame":this.showFrame,
                "insertSlider":this.insertFrame,
                "enterEditorMode":this.enterEditorMode,
                "enterPreviewMode":this.enterPreviewMode,
                "changeScreenScale" : this.changeScreenScale,
                "createThumb" : this.createThumb
            });
            //初始化窗口大小与margin
            global.refleshFrameListMargin(SCREEN_SIZE_MAP[DEFAULT_SCREEN]);
            var sMap = SCREEN_SIZE_MAP[DEFAULT_SCREEN];

            FRAME_Y = sMap.y;
            FRAME_X = sMap.x;
            FRAME_SCALE_SIZE = sMap.scale;

            $('#frame_view_menu').on('click .menu-item', function (evt) {
                var $tar = $(evt.target),
                    dataId = global._paramCache['curFrameId'].match(/[0-9]*$/),
                    type = $tar.data('type'),
                    evtType = $tar.data('event'),
                    params;
                if (!$tar.hasClass('menu-item')) return;
                switch (type) {
                    case 'create' : 
                        params = 'append';
                        break;
                    case 'insert' : 
                        params = {
                            'method' : 'insert',
                            'dataId' : dataId
                        };
                        break;
                    case 'delete' : 
                        params =  dataId;
                        break;
                }
                sb.notify({
                    type : evtType,
                    data : params
                })
                $('#frame_view_menu').addClass('dp-none');
            })
            $(document).on('click', function (evt) {
                if ( !$(evt.target).hasClass('view-menu') ) {
                    
                    if (global._paramCache['curFrameId']) {
                        $(frames[global._paramCache['curFrameId']]).parent().removeClass('right-menu-sel');
                    }
                    $('#frame_view_menu').addClass('dp-none');
                }
            })

        },
        destroy:function(){
        },
        //更改预览窗口的大小
        changeScreenScale : function (value) {
            var sMap = SCREEN_SIZE_MAP[value]
            if (!sMap) {
                sMap = SCREEN_SIZE_MAP[DEFAULT_SCREEN]
            }
            FRAME_X = sMap.x;
            FRAME_Y = sMap.y;
            FRAME_SCALE_SIZE = sMap.scale;

            global.refleshFrameListMargin(value)
            global.refleshFrameViewSize();
        },
        createThumb : function () {
            var frame = frames.getFirstElement();
            // html2canvas( [ document.querySelector('#canvas .container') ], {
            //     onrendered: function(canvas) {
            //         console.log('html to canvas');
            //         $(canvas).css({
            //             'height': '160px',
            //             'width' : '120px'
            //         })
            //         document.body.appendChild(canvas);
            //     }
            // });
        },
        refleshFrameListMargin : function (value) {
            $("#frame-list").css('margin-top', MAGIN_TOP_MAP[value])
        },
        //更新每个窗口
        refleshFrameViewSize : function () {
            
            frames.forEach(function (item, key) {
                $(item)
                    .css('height', FRAME_Y * FRAME_SCALE_SIZE + 'px')
                    .css('width', FRAME_X * FRAME_SCALE_SIZE + 'px');
                item.style['WebkitTransform'] =  'scale(' + conf.SCALE_SIZE/FRAME_SCALE_SIZE + ')';
            });
            $('.frameCon').css('height', FRAME_Y*conf.SCALE_SIZE  + 'px').css('width', FRAME_X*conf.SCALE_SIZE + 'px')
        },
        insertFrame:function(){
            global.addSlider("insert");
            global.updateFrameLabel();
        },
        addFrameObject:function(frame,method,pos){
            if(method=="insert") {
                frames.insert(frame,"before",pos);
                if(!dispFrames[pos]){
                    Core.log("frame display error");
                }else dispFrames.insert(frame,"before",pos);
            }
            else if(method=="append") {
                frames[frame.key] = frame.value;
                dispFrames[frame.key] = frame.value;
            }
            else Core.log("wrong insert slider method!");
        },
        addFrameElement:function(elem,method,pos,container){
            if(method=="insert") container.insertBefore(elem, pos);
            else if(method=="append") container.appendChild(elem);
            else Core.log("wrong insert slider-Element method!");
        },
        addSlider:function(method){

            var frameDataId;
            if (typeof(method) == 'object') {
                var params = method;
                method = params.method;
                frameDataId = 'frame' + params.dataId;
            }
            var frame = global.createFrame(method);
            if(method == "append") {
                global.addFrameElement(frame.frameCon ,method,null,frameContainer);
            }
            else if(method == "insert") {
                var posParent = $(frames[(frameDataId || currentFrame)]).parent()[0]
                global.addFrameElement(frame.frameCon ,method, posParent,frameContainer);
            }
            global.changeDisplayFrameList(frame.id, method);
            global.updateFrameLabel();
        },
        deleteFrame:function(delId){
            //nearFrame:当前frame的邻近frame,
            //method {'before','after'}:the sequence insert into dispFrames
            // delId = delId ? 'frame' + delId : delId;
            // var tarDelData = currentFrame;
            // console.log('delete frame : ', currentFrame);
            global.showFrame('frame' + delId);
            var nearFrame, method;
            //select from display frames
            nearFrame = frames.getSlider("pre",currentFrame,-1)||
            frames.getSlider("next",currentFrame,-1);
            if(nearFrame == null){
                //select from all frames
                nearFrame = frames.getSlider(method = "pre",currentFrame,-1)||
                frames.getSlider(method = "next",currentFrame,-1);
            }
            //显示新的预览列表
            var oldCurr = global.showFrame(nearFrame, method=="pre"?"before":"after");
            //删除预览frame
            if(oldCurr){
                frameContainer.removeChild($(frames[oldCurr]).parent()[0]);
                frame_count--;
                delete frames[oldCurr];
                if(dispFrames[oldCurr]) delete dispFrames[oldCurr];
                if(hidFrames[oldCurr]) delete hidFrames[oldCurr];  
            }
            //指定当前显示窗口，重绘窗口列表
            global.changeDisplayFrameList(currentFrame,"delete");
            global.updateFrameLabel();
        },
        /*
         *get a appropriate hidden frame and display it
         *pos {'head','end'}
         */
        displayFrame:function(){
            var disIndexA,disIndexB,dispFrame = null,disAID,disBID;
            disAID = dispFrames.getFirstElement();
            disBID = dispFrames.getLastElement();
            disIndexA = frames.findIndex(disAID);
            disIndexB = frames.findIndex(disBID);
            if(disIndexA>1){
                dispFrame = frames.getSlider(null, null, disIndexA-1);
                dispFrames.insert({
                    key:dispFrame,
                    value:frames[dispFrame]
                }, "before", disAID);
            }
            else {
                if(disIndexB<frames.length){
                    dispFrame = frames.getSlider(null, null, disIndexB+1);
                    dispFrames.insert({
                        key:dispFrame,
                        value:frames[dispFrame]
                    }, "after", disBID);
                }
            }
            if(dispFrame){
                delete hidFrames[dispFrame];
                // frames[dispFrame].style.display = "block";
                $(frames[dispFrame]).parent().show();
            }
        },
        /*
         *show the slider of the frame
         *if frame is not exist,create a new frame
         *返回前一个frame，没有就返回null
         */
        showFrame:function(frameID){
            var curr;
            console.log('will show : ' + frameID);
            if(frameID&&frames[frameID]){
                //currentFrame = frameID;
                //若为第一个帧，显示该帧所在的组
                if(frameID == dispFrames.getFirstElement()){
                    curr = currentFrame;
                    global.changeDisplayFrameList(frameID,"showPre");
                    window.setTimeout(function(){
                        // frameContainer.className = "anim-move-left";
                    });
                    return curr;
                }
                //若为最后一个帧，显示该帧所在的组
                else if(frameID == dispFrames.getLastElement()&&dispFrames.length()>=MAX_FRAME_NUMBER){
                    curr = currentFrame;
                    global.changeDisplayFrameList(frameID,"showNext");
                    window.setTimeout(function(){
                        // frameContainer.className = "anim-move-right";
                    });
                    return curr;
                }
                return changeCurrFrameFunc(frameID);
            }else{
                curr = currentFrame;
                global.addSlider("append");
                return curr;
            }
        },
        /*
         * function:1.change currentFrame to new currentFrame
         *          2.delete currentFrame in hidFrames
         *          3.insert newCurr into dispFrames
         *          4.display newCurr  
         *          5.return oldCurr
         * 
         */
        changeCurrFrame:function(newCurr,method){
            var oldCurr = null;
            if(!dispFrames[newCurr]){
                delete hidFrames[newCurr];
                dispFrames.insert({
                    key:newCurr,
                    value:frames[newCurr]
                }, method, currentFrame);   
            }
            oldCurr = currentFrame;
            if(frames[currentFrame]) $(frames[currentFrame]).parent().removeClass("focus");;
            currentFrame = newCurr;
            // frames[currentFrame].style.display = "block";
            $(frames[currentFrame]).parent().show();
            $(frames[currentFrame]).parent().addClass("focus");
            sb.notify({
                type:"changeSlider",
                data:parseInt(currentFrame.substr("frame".length,currentFrame.length))
            });
            if(oldCurr){
                var dataSet = sb.data("sliderDataSet"),
                    sliders = sb.data("sliders"),
                    frameNumber = oldCurr.substr("frame".length, oldCurr.length),
                    frameData = dataSet["slider"+frameNumber],
                    slider = sliders["slider"+frameNumber],
                    elements = getElementDataFunc(frameData);

                global.showFrameElementByData(elements,oldCurr, slider);
            }
            return oldCurr;
        },
        getElementData:function(dataSet){
            var data,datas = {},container,type,value,elem,zIndex,height,width,left,top;
            for(var o in  dataSet){
                if(dataSet.hasOwnProperty(o)){
                    container = dataSet[o].container;
                    elem = dataSet[o].data;
                    type = elem.tagName;
                    value = elem.src || elem.innerHTML;
                    zIndex = dataSet[o].zIndex;
                    height = container.style.height||elem.style.height;
                    width = container.style.width||elem.style.width;
                    data = {
                        "type"    :type,
                        "value"   :value,
                        "attr"    :container.getAttribute("style"),
                        "panelAttr"   :type === "IMG" ? $(".element-panel",container).attr("style") : "",
                        "left"    :container.style.left,
                        "top"     :container.style.top,
                        "height"  :height,
                        "width"   :width,
                        "zIndex"  :zIndex
                    };
                    datas[o] = data;
                }
            }
            return datas;
        },
        showFrameElementByData:function(data,frame, slider){

            var elem = null,borderWidth;
            var frameEelem = frames[frame];
            var framePanel = sb.find(".frame-panel", frameEelem);
            //清空
            frameEelem.innerHTML = "";
            //再添加
            if(framePanel){
                frameEelem.appendChild(framePanel);
            }
            $(framePanel).attr('style', $(slider).find('.panel').attr('style'))
            for(var a in data){
                if(data.hasOwnProperty(a)){
                    elem = document.createElement("div");
                    elem.setAttribute("style", data[a].attr);
                    borderWidth = elem.style.borderWidth;
                    elem.style.position = "absolute";
                    // elem.style.left = (parseInt(data[a].left)/VIEWSCALE)+"px";
                    // elem.style.top = (parseInt(data[a].top)/VIEWSCALE)+"px";
                    // elem.style.height = (parseInt(data[a].height)/VIEWSCALE)+"px";
                    // elem.style.width = (parseInt(data[a].width)/VIEWSCALE)+"px";
                    elem.style.left     = data[a].left;
                    elem.style.top      = data[a].top;
                    elem.style.height   = data[a].height;
                    elem.style.width    = data[a].width;
                    if(borderWidth) {
                        // elem.style.borderWidth = parseInt(parseInt(borderWidth)/VIEWSCALE+0.5)+"px";
                        elem.style.borderWidth = borderWidth;
                    }
                    elem.style.zIndex = data[a].zIndex;
                    if(data[a].type=="IMG"){
                        var img = new Image();
                        var panel = sb.create("div");

                        panel.setAttribute("style", data[a].panelAttr);
                        $(img).attr('style', data[a].panelAttr);
                        img.src = data[a].value;
                        img.style["height"] = "100%";
                        img.style["width"]= "100%";
                        img.style["borderTopLeftRadius"]= elem.style["borderTopLeftRadius"];
                        img.style["borderTopRightRadius"]= elem.style["borderTopRightRadius"];
                        img.style["borderBottomLeftRadius"]= elem.style["borderBottomLeftRadius"];
                        img.style["borderBottomRightRadius"]= elem.style["borderBottomRightRadius"];
                        elem.appendChild(img);
                        elem.appendChild(panel);
                    }
                    else if(data[a].type=="DIV" || data[a].type === 'CODE'){
                        var text = document.createElement("div");
                        text.innerHTML = data[a].value;
                        text.className = "text";
                        // var theight = (parseInt(data[a].height.substr(0,data[a].height.length-2)));
                        // var twidth = (parseInt(data[a].width.substr(0,data[a].width.length-2)));
                        // text.style.top = ((-theight*(VIEWSCALE-1)/(VIEWSCALE))/2)+"px";
                        // text.style.left = ((-twidth*(VIEWSCALE-1)/(VIEWSCALE))/2)+"px";
                        // text.style.top = data[a].top;
                        // text.style.left = data[a].left;
                        // text.style.height = data[a].height;
                        // text.style.width = data[a].width;
                        // text.style.position = "relative";
                        text.style.height = '100%';
                        text.style.width = '100%';
                        elem.className = "textCon";
                        elem.appendChild(text);
                        elem.style.overflow = "hidden";
                    } 
                    else if (data[a].type === 'VIDEO') {
                        $(elem).css('backgroundColor', 'black').addClass('video-play'); 
                    }
                    else{

                        console.log("unsupport type :" + data[a].type);
                    }
                    frames[frame].appendChild(elem);
                }
            }
        },
        /*
         *change current display frame-list
         *function:1.如果为向后追加，则begin元素显示在尾部；
         *          2.如果为插入方式，则begin元素显示在头部；
         *
         */
        changeDisplayFrameList:function(begin,method){
            var beginIndex = -1,endIndex = -1,newDispFrames = null,length,frame = null;
            beginIndex = frames.findIndex(begin);

            if(method=="append"){
                var indexA = beginIndex;
                if((indexA=(indexA - MAX_FRAME_NUMBER+1))<1){
                    indexA = 1;
                }
                endIndex = beginIndex;
                beginIndex = indexA;
            }
            else if(method=="insert"){
                var headDispIndex = frames.findIndex(dispFrames.getSlider(null, null, 1));
                beginIndex = headDispIndex;
                endIndex = beginIndex+MAX_FRAME_NUMBER-1;
            }
            else if(method=="delete"){
                beginIndex = frames.findIndex(dispFrames.getSlider(null, null, 1));
                endIndex  = beginIndex + MAX_FRAME_NUMBER-1;
            }
            else if(method=="showPre"){
                var indexB = beginIndex;
                if((indexB=(indexB-MAX_FRAME_NUMBER+1))<1){
                    indexB = 1;
                }
                endIndex = indexB+MAX_FRAME_NUMBER-1;
                beginIndex = indexB;
            }
            else if(method=="showNext"){
                endIndex = beginIndex+MAX_FRAME_NUMBER-1;
            }
            else {
                Core.log("changeDisplayFrameListError!");
                return;
            }
            newDispFrames = frames.subSet(beginIndex,endIndex);
            for(var o in frames){
                if(frames.hasOwnProperty(o)){
                    // frames[o].style.display = "none";
                    $(frames[o]).parent().hide();
                    hidFrames[o] = frames[o];
                    delete dispFrames[o];
                }
            }
            length  = newDispFrames.length;
            for (var i = 0; i < length; i++) {
                frame = newDispFrames[i];
                dispFrames[frame] = frames[frame];
                // dispFrames[frame].style.display = "block";
                $(dispFrames[frame]).parent().show();
                delete hidFrames[frame];
            }
            var old = global.changeCurrFrame(begin,"append");
        },
        /*
         *function：1.create a new frame-element{DIV}
         *          2.add frame-number and frame-count
         *          3.offer the method insert or append to the frames
         *          4.add the frame event handle
         *          5.return Object:{id,frame}
         */
        createFrame : function(method){
            var scaleSize = conf.SCALE_SIZE,
                frame = document.createElement("div"),
                frameCon = document.createElement("div"),
                frameLabel = document.createElement('div'),
                framePanel = sb.create("div");

            var opDataId = null;
            if (  method && ( typeof(method) === 'object' ) ) {
                var param = method;
                method = param.method;
                opDataId = 'slider' + param.dataId;
            }
            //指示当前当前frame下标
            $(frameLabel).css({
                position : 'absolute',
                bottom  : '-20px',
                width   : '100%',
                height : '20px',
                textAlign : 'center',
                fontSize : '14px'
            }).addClass('frame-label');
            $(frameCon).append(frame).append(frameLabel).attr('title', '右键打开操作菜单');
            frame.appendChild(framePanel);
            frame.className = "frame scale";
            framePanel.className = "frame-panel";
            frame.setAttribute("style", "display:block;");
            $(frame)
                .css('height', FRAME_Y * FRAME_SCALE_SIZE + 'px')
                .css('width', FRAME_X * FRAME_SCALE_SIZE + 'px');
            $(frame)[0].style['WebkitTransform'] =  'scale(' + conf.SCALE_SIZE/FRAME_SCALE_SIZE + ')';
            $(frameCon)
                .addClass('frameCon')
                .css('height', FRAME_Y*scaleSize + 'px').css('width', FRAME_X*scaleSize + 'px');

            framePanel.setAttribute("style", "position:absolute;width:100%;height:100%;");
            frame_number++;
            frame_count++;
            var frameID = "frame"+frame_number;
            //            frames[frameID] = frame;
            if(method=="append") global.addFrameObject({
                key:frameID,
                value:frame
            },method,null);
            else if(method=="insert") global.addFrameObject({
                key:frameID,
                value:frame
            },method, (opDataId || currentFrame));
            var SframeNum = frame_number;
            frame.addEventListener("click", function(){
                sb.notify({
                    type:"changeSlider",
                    data:SframeNum
                });
                sb.notify({
                    type:"changeFrame",
                    data:frameID
                });
            },false);
            $(frame).on('mousedown ', function (evt) {
                if (evt.button === 2) {
                    evt.target.oncontextmenu = function(){
                        return false;
                    }
                    if (global._paramCache['curFrameId']) {
                        $(frames[global._paramCache['curFrameId']]).parent().removeClass('right-menu-sel');
                    }
                    $('#frame_view_menu').removeClass('dp-none').css({
                        top : evt.clientY - $('#frame_view_menu')[0].offsetHeight,
                        left : evt.clientX
                    })
                    global._paramCache['curFrameId'] = frameID;
                    $(frame).parent().addClass('right-menu-sel');
                }
            })
            return {
                id:"frame"+frame_number,
                frame:frame,
                frameCon : frameCon
            }
        },
        updateFrameLabel : function () {
            var frames = document.querySelectorAll('#view .frameCon');
            _.each(frames, function (frame,index) {
                $(frame).find('.frame-label').html(index + 1);
            })
        },
        changeSliderStyle:function(att){
            sb.find(".frame-panel",frames[currentFrame]).style[att.key] = att.value;
        },
        enterEditorMode:function(){
            $(sb.container).removeClass('dp-none');
        },
        enterPreviewMode:function(){
            $(sb.container).addClass('dp-none');
        }
    };
});
