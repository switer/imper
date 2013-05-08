Core.registerModule("toolbar",function(sb){
    var addImageApp=null,addTextApp=null,addSliderApp=null,deleteSlider = null,toolAppItems =null,header=20,toolbarY = 600,viewY = 80,
    insertSlider = null,enterPreviewMode = null,operation = null,appOptTout = -1,tarApp = null,previewApp = null,
    appDetailItems = null,toolAppMenu = null,operationSubMenuItems = null, item;
    var ecb,
        global;
    return {
        init:function(){
            global = this;

            this._textMatches = {
                'foreColor' : sb.lang().textbar_foreColor,
                'hiliteColor' : sb.lang().textbar_hiliteColor
            }

            ecd = sb.find("#execCommand-detail",document);
            ecb = sb.find("#execCommand-bar",document);
            // showEcdBut = sb.find(".show_execCommandDetail",document);
            ecdresize = sb.find(".resize",ecd);
            // ecdmove = sb.find(".move",ecd);
            // closeEcd = sb.find(".close-menu",ecd);
            colorSelector = sb.find("#colorSelector",document);
            execCType = sb.find(".execC_type",colorSelector);
            link = sb.find("#setlink",document);
            link_but  = sb.find(".font-link",ecd);
            comfirmLink = sb.find(".comfirm-link",link);
            fontColor_but = sb.find(".font-color",ecd);
            fontBackground_but = sb.find(".font-background",ecd);
            linkValue = sb.find(".link-value",link);
            sb.css(ecd,{
                // display:'none',
                // height:'40px',
                top:'100px',
                left:'100px'
            });
            $(ecd).find('[data-isFeed]').on('click', function (e) {
                var $tar = $(e.target).hasClass("execC-but") ? $(e.target) : $(e.target).find(".execC-but"), 
                    $parent = $tar.hasClass("execCommand-item") ? $tar : $tar.parent();
                var action = $tar.data('action');
                //wakaka eval !!!
                eval(action);
                if ($parent.hasClass('active')) $parent.removeClass('active');
                else {$parent.addClass('active');}
            })
            $('.close-menu', ecd).css('top','-10px').css('right','-10px')
            sb.css(link,{
                display:"none",
                width:'240px',
                heiht:'25px',
                top:(sb.subPX(ecd.style.top)-50)+"px",
                left:(sb.subPX(ecd.style.left)-260)+"px"
            });
            // sb.resizeRB(ecdresize, ecd);
            sb.move(ecd,ecd);
            sb.listen({
                "showLink":this.showLink,
                "showColor":this.showColor,
                "showEcd":this.showEcd,
                "hiddenStyleBar":this.hiddenStyleBar,
                "showStyleBar":this.showStyleBar
                
            });
            comfirmLink.addEventListener("click", function(){
                document.execCommand("createLink", false, linkValue.value);
                $('#setlink').css('display ', 'none');
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
            // $(linkValue).on('mouseover', function () {
            //     $(this).focus();
            // })
            // showEcdBut.addEventListener("click", function(e){
            //     sb.notify({
            //         type:'showEcd',
            //         data:e
            //     });
            // }, false);
            // closeEcd.addEventListener("click", function(e){
            //     sb.notify({
            //         type:'showEcd',
            //         data:e
            //     });
            // }, false);


            toolAppItems = sb.query(".tool-app");
            enterPreviewMode = sb.find("#tool-enterPreviewMode");
            addImageApp = sb.find("#tool-addimage");
            addTextApp = sb.find("#tool-addtext");
            addSliderApp = sb.find("#tool-addslider");
            previewApp = sb.find("#tool-preview");
            operation = $("#tool-operation")[0];
            operationSubMenuItems = sb.query(".operation-item",operation);
            toolAppMenu = sb.find("#tool-buttons");
            appDetailItems = sb.query(".ondetail",toolAppMenu);
            sb.listen({
                "enterEditorMode":this.enterEditorMode,
                "enterPreviewMode":this.enterPreviewMode,
                "windowResize":this.windowResize 
            });
            $('.showAnim').on('click', function () {

            })
            //取消按钮点击时出现的全选情况
            for (var i = 0; item =  toolAppItems[i]; i++){
                item.onselectstart = function(){
                    return false;
                }
            }

            $('#tool-addAnimation,.showAnim').on("click", function(event){
                $('#tool-addAnimation,.showAnim').removeClass('on');
                var tar = event.currentTarget,
                    $operation = $('#tool-operation');
                if ( $operation.hasClass('dp-none')) {
                    $operation.removeClass('dp-none')
                              .css('top' , (event.clientY + 10)+"px")
                              .css('left' , (event.clientX + 10)+"px");
                    $(this).addClass('on');
                }
                else 
                    $operation.addClass('dp-none');
                
            });

            //初始化工具子菜单的点击事件
            for (i = 0; item =  operationSubMenuItems[i]; i++) {
                item.onclick = function(e){
                    var notifyEvt = e.currentTarget.getAttribute("data-event");
                    var param = e.currentTarget.getAttribute("data-param");
                    sb.notify({
                        type : notifyEvt,
                        data : param
                    });
                    $('#tool-addAnimation,.showAnim').removeClass('on');
                    $('#tool-operation').addClass('dp-none')
                }
            }
            enterPreviewMode.onclick = function(){
                sb.notify({
                    type:"enterSaveFile",
                    data:{}
                });
            }
            addImageApp.onchange = function(){
                sb.notify({
                    type:"addImage",
                    data:sb.find("#addImageInp")
                });
                addImageApp.innerHTML = "<input type='file' id='addImageInp'/>";
            };
            $('#tool-addVideo').on('change', function(){
                sb.notify({
                    type:"addVideo",
                    data:sb.find("#addVideoInp")
                });
                $('#tool-addVideo').html( "<input type='file' id='addVideoInp'/>" );
            });
            
            $('#tool-import').on('change', function () {
                sb.notify ({
                    type: "onImportSlider",
                    data: sb.find("#importInp")
                });
                $('#tool-import').html("<input type='file' id='importInp'/>");
            })
            $('#tool-openFileSystem').on('click', function () {
                sb.notify ({
                    type: "openFileSystem",
                    data: sb.find("#importInp")
                });
            })
            $('#tool-screen').on('click', function (e) {
                var $sb = $(global._screenBoard);
                $sb.css('top', e.clientY + 'px');
                screenBoard.toggle(global._screenBoard);
            })

            $("#tool-addCode").on('click', function () {
                sb.notify({
                    type : 'addCode',
                    data : null
                });
            });
            // $("#tool-help").on('click', function () {
            //     introJs().start();
            // })
            $("#tool-mapEditing").on('click', function () {
                console.log('----------');
                sb.notify({
                    type : 'enterMapEdtingMode',
                    data : null
                })
            })
            $('#tool-play').on('click', function () {
                sb.notify({
                    type : 'playSlider',
                    data : null
                })
            })
            var $bar = $('#toolbar');
            $bar.on('click', function (evt) {
                var eId = $(evt.target)[0].id;
                if ( eId !== 'tool-buttons' && eId !== 'toolbar') return; 
                if ( $bar.hasClass("l-tb") ) $bar.removeClass('l-tb')
                else $bar.addClass('l-tb');
            })
            addTextApp.onclick = function(){
                sb.notify({
                    type:"addText",
                    data:{}
                });
            };
            // addSliderApp.onclick = function(){
            //     sb.notify({
            //         type:"addSlider",
            //         data:"append"
            //     });
            // };
            // deleteSlider.onclick = function(){
            //     console.log('on click delete slider');
            //     sb.notify({
            //         type:"deleteSlider",
            //         data: null
            //     });  
            // };
            // insertSlider.onclick = function(){
            //     sb.notify({
            //         type:"insertSlider",
            //         data: null
            //     });  
            // };

            //颜色取色板
            var cb = window.colorboard.create(function (value) {
                document.execCommand(global._execType,false, value);
                $(global._colorboard).css('display', 'none')
            })
            document.body.appendChild(cb);
            global._colorboard = cb;


            //幻灯片分辨率选择框
            var scrnb = window.screenBoard.create();
            //初始隐藏
            screenBoard.hide(scrnb);

            window.screenBoard.listen(scrnb, function (value) {
                sb.notify({
                    type : 'changeScreenScale',
                    data : value
                })
            });
            document.body.appendChild(scrnb);
            sb.move(scrnb, scrnb);
            global._screenBoard = scrnb;

        },
        destroy:function(){
            addImageApp=null;
            addTextApp=null;
        },
        windowResize:function(){
            // sb.container.style["marginTop"] = ((window.innerHeight-toolbarY-viewY-header)/2+header)+"px";
        },
        enterEditorMode:function(){
            sb.container.style.display = "block";
        },
        enterPreviewMode:function(){
            sb.container.style.display = "none";
            screenBoard.hide(global._screenBoard);
            $('.colorSelector').css('display', 'none');
            $('#tool-operation').addClass('dp-none')
            
        },
        showLink:function(e){
            link.style.display = link.style.display=="none"?"block":"none";
            if((sb.subPX(ecd.style.top)-65)>=0) link.style.top = (sb.subPX(ecd.style.top)-65)+"px";
            else link.style.top = (sb.subPX(ecd.style.top)+65)+"px";
            link.style.left = (e.clientX-130)+"px";
        },
        showColor:function(data){

            var colorSelector = global._colorboard;
            window.colorboard.title(colorSelector, global._textMatches[data.type]);

            if( colorSelector.style.display =="block" && global._execType != data.type ){

            } else {
                colorSelector.style.display = colorSelector.style.display=="none"?"block":"none";
            }
            global._execType = data.type;

            if(sb.subPX(ecd.style.top)-170>=0) colorSelector.style.top = (sb.subPX(ecd.style.top)-170)+"px";
            else colorSelector.style.top = (sb.subPX(ecd.style.top)+50)+"px";
            colorSelector.style.left = (data.event.clientX-100)+"px";
        },
        showEcd:function(){
            if(ecd.style.display=="block"){
                global.hideEcd();
            }else{
                ecd.style.display = "block";
            }
        },
        hideEcd : function () {
            colorSelector.style.display = "none";
            ecd.style.display = "none"
            link.style.display = "none";
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