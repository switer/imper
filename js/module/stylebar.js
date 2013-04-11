Core.registerModule("stylebar",function(sb){
    var ecd,ecb,showEcdBut,ecdresize,ecdmove,link,link_but,comfirmLink,linkValue,
    fontColor_but,fontBackground_but,colorSelector,execCType,closeEcd;
    return {
        init:function(){
            ecd = sb.find("#execCommand-detail",document);
            ecb = sb.find("#execCommand-bar",document);
            showEcdBut = sb.find(".show_execCommandDetail",ecb);
            ecdresize = sb.find(".resize",ecd);
            ecdmove = sb.find(".move",ecd);
            closeEcd = sb.find(".close-menu",ecd);
            colorSelector = sb.find("#colorSelector",document);
            execCType = sb.find(".execC_type",colorSelector);
            link = sb.find("#setlink",document);
            link_but  = sb.find(".font-link",ecd);
            comfirmLink = sb.find(".comfirm-link",link);
            fontColor_but = sb.find(".font-color",ecd);
            fontBackground_but = sb.find(".font-background",ecd);
            linkValue = sb.find(".link-value",link);
            sb.css(ecd,{
                display:'none',
                width:'auto',
                height:'30px',
                top:'580px',
                left:(window.innerWidth-700)+'px'
            });
            $('.close-menu', ecd).css('top','-10px').css('right','-10px')
            sb.css(link,{
                display:"none",
                width:'240px',
                heiht:'25px',
                top:(sb.subPX(ecd.style.top)-50)+"px",
                left:(sb.subPX(ecd.style.left)-260)+"px"
            });
            sb.resizeRB(ecdresize, ecd);
            sb.move(ecdmove,ecd);
            sb.listen({
                "showLink":this.showLink,
                "showColor":this.showColor,
                "showEcd":this.showEcd,
                "hiddenStyleBar":this.hiddenStyleBar,
                "showStyleBar":this.showStyleBar
            });
            comfirmLink.addEventListener("click", function(){
                document.execCommand("createLink", false, linkValue.value);
            }, false);
            link_but.addEventListener("click", function(e){
                sb.notify({
                    type:'showLink',
                    data:e
                });
            }, false);
            fontColor_but.addEventListener("click", function(e){
                sb.notify({
                    type:'showColor',
                    data:{
                        event:e,
                        type:"foreColor"
                    }
                });
            }, false);
            fontBackground_but.addEventListener("click", function(e){
                sb.notify({
                    type:'showColor',
                    data:{
                        event:e,
                        type:"hiliteColor"
                    }
                });
            }, false);
            showEcdBut.addEventListener("click", function(e){
                sb.notify({
                    type:'showEcd',
                    data:e
                });
            }, false);
            closeEcd.addEventListener("click", function(e){
                sb.notify({
                    type:'showEcd',
                    data:e
                });
            }, false);
        },
        destroy:function(){
            ecd = null;
        },
        showLink:function(e){
            link.style.display = link.style.display=="none"?"block":"none";
            if((sb.subPX(ecd.style.top)-50)>=0) link.style.top = (sb.subPX(ecd.style.top)-50)+"px";
            else link.style.top = (sb.subPX(ecd.style.top)+50)+"px";
            link.style.left = (e.clientX-130)+"px";
        },
        showColor:function(data){
            if(colorSelector.style.display=="block"&&execCType.value != data.type){
            }else{
                colorSelector.style.display = colorSelector.style.display=="none"?"block":"none";
            }
            execCType.value = data.type;
            if(sb.subPX(ecd.style.top)-170>=0) colorSelector.style.top = (sb.subPX(ecd.style.top)-170)+"px";
            else colorSelector.style.top = (sb.subPX(ecd.style.top)+50)+"px";
            colorSelector.style.left = (data.event.clientX-100)+"px";
        },
        showEcd:function(){
            if(ecd.style.display=="block"){
                colorSelector.style.display = "none";
                ecd.style.display = "none"
                link.style.display = "none";
            }else{
                ecd.style.display = "block";
            }
        },
        hiddenStyleBar:function(){
            sb.container.style.display = "none";
            ecd.style.display = "none";
            colorSelector.style.display = "none";
            link.style.display = "none";
        },
        showStyleBar:function(){
            sb.container.style.display = "block";
        }
    };
});
