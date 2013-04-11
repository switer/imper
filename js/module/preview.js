Core.registerModule("slider-preview",function(sb){
    var canvas = null,code = null,sliders = null,setTargetFunc,targetSlider = null,
    sliderH = 600,sliderW = 800,keyonFunc;
    return {
        init:function(){
            canvas = sb.container;
            canvas.style.height = sliderH+"px";
            canvas.style.width = sliderW+"px";
            code  = sb.find("#code");
            editor  = document.querySelector("#canvas");
            view  = document.querySelector("#view");
            toolbar  = document.querySelector("#toolbar");
            setTargetFunc = this.setTarget;
            keyonFunc = this.keyOn;
            sb.listen({
                "previewMode":this.preview,
                "previewModeStart":this.start,
                "previewModeStop":this.stop,
                "preSlider":this.preSlider,
                "nextSlider":this.nextSlider,
                "windowResize":this.windowResize 
            });
        },
        destroy:function(){
        },
        windowResize:function(){
            // sb.container.style["marginTop"] = (window.innerHeight-sliderH)/2+"px";
        },
        start:function(DATA){
            sliders = new sb.ObjectLink();
            canvas.style.display = "block";
            canvas.innerHTML = "";
            canvas.appendChild(code);
            sb.notify({
                type:"previewMode",
                data:DATA
            });
            sb.bind(window, "keyup",keyonFunc);
        },
        stop:function(){
            sliders = null;
            canvas.style.display = "none";
            targetSlider = null;
            sb.unbind(window, "keyup", keyonFunc);
            sb.notify({
                type:"enterEditorMode",
                data:null
            });
        },
        setTarget:function(newTar){
            var className;
            if(targetSlider&&sliders[targetSlider]) {
                sliders[targetSlider].style.display = "none";
            }
            targetSlider = newTar;
            code.innerHTML = sliders.findIndex(targetSlider)+"/"+sliders.length();
            className = sliders[targetSlider].className;
            sliders[targetSlider].style.display = "block";
            window.setTimeout(function(){
                sliders[targetSlider].className = className;
            });
        },
        keyOn:function(event){
            if(event.keyCode==27){
                sb.notify({
                    type:"previewModeStop",
                    data:null
                });
            }
            if(event.keyCode ==37||event.keyCode ==38) {
                sb.notify({
                    type:"preSlider",
                    data:{}
                });
            }
            else if(event.keyCode==39||event.keyCode ==40) {
                sb.notify({
                    type:"nextSlider",
                    data:{}
                });
            }
        },
        preSlider:function(){
            if(!targetSlider) return;
            var index = sliders.findIndex(targetSlider),tar = sliders[targetSlider],newTar;
            if(index==1) {
                alert("It is the first slider !");
                return;
            }
            newTar = sliders.getSlider(null,null,index-1);
            setTargetFunc(newTar);
        },
        nextSlider:function(){
            if(!targetSlider) return;
            var index = sliders.findIndex(targetSlider),length = sliders.length(),newTar;
            if(index==length) {
                alert("It is the last slider !");
                return;
            }
            newTar = sliders.getSlider(null,null,index+1);
            setTargetFunc(newTar);
        },
        preview:function(DATA){
            // canvas.style["marginTop"] = (window.innerHeight-sliderH)/2+"px";
            for(var s in DATA){
                if(DATA.hasOwnProperty(s)){
                    var slider = document.createElement("DIV"),elements = DATA[s].element;
                    var panel = sb.create("div");
                    panel.setAttribute("style", DATA[s].panelAttr);
                    slider.appendChild(panel);
                    slider.className = "slider "+DATA[s].anim;
                    sliders[s] = slider;
                    slider.style.display = "none";
                    for (var e in elements) {
                        if(elements.hasOwnProperty(e)){
                            var data = elements[e],elem;
                            if(data.type=="DIV"){
                                elem = document.createElement("DIV");
                                elem.innerHTML = data.value;
                                elem.setAttribute("style", data.cAttr+data.eAttr);
                                elem.style.zIndex = data.zIndex;
                            }
                            else if(data.type=="IMG"){
                                elem = sb.create("div");
                                var imgPanel = sb.create("div");
                                imgPanel.setAttribute("style", data.panelAtt);
                                var img = new Image();
                                img.src = data.value;
                                elem.appendChild(img);
                                elem.appendChild(imgPanel);
                                elem.setAttribute("style", data.cAttr);
                                img.style["borderTopLeftRadius"] = elem.style["borderTopLeftRadius"];
                                img.style["borderTopRightRadius"] = elem.style["borderTopRightRadius"];
                                img.style["borderBottompLeftRadius"] = elem.style["borderBottompLeftRadius"];
                                img.style["borderBottomRightRadius"] = elem.style["borderBottomRightRadius"];
                                img.style["height"] = "100%";
                                img.style["width"] = "100%";
                                elem.style.zIndex = data.zIndex;
                            }
                            if(elem) slider.appendChild(elem);
                        }
                    }
                    canvas.appendChild(slider);
                }
            }
            setTargetFunc(sliders.getSlider(null,null,1));
        }
    };
});
