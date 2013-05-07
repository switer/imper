Core.registerModule("shapebar", function(sb){

	var lang = sb.lang(),
    	conf = {
    		PATNING_BOARD_HEIGHT : 300,
    		PATNING_BOARD_WIDTH : 300,
    		PAINTNG_BOARD_RIGHT : 120,
    		DEFAULT_ERASER_COLOR : 'rgba(255,255,255,0)',
    		DEFAULT_ERASER_SIZE : 10,
    		DEFAULT_PAINTING_SIZE : 6
    	},
    	global;
	return {
		init : function () {
			global = this;
			sb.listen({
                "enterEditorMode":this.enterEditorMode,
                "enterPreviewMode":this.enterPreviewMode,
                "windowResize":this.windowResize,
                "refleshpaintBoard" : this.refleshpaintBoard
            });
            //插入图形
			$('.shape-icon').on('click', function (e) {
				var $target = $(e.target),
					type = $target.data('type'),
					$this = $(this);
				//自定义图形
				if (type === 'custom') {
					if (!$this.hasClass('on') ) {
						global.showPaintingBoard(e.clientY);
					}
					else {
						global.hidePaintingBoard();
					}

					
				} else {
					var clientX = $()
					global._chooseColor(e.clientY, function (color) {
						var shapeData = sb.drawShape(type, color);
						sb.notify({
							type : 'addImage',
							data : {
								'shape' : true,
								'value' : shapeData
							}
						})
					});
				}

			})
			var $bar = $('#shapebar');
            $bar.on('click', function (evt) {
                if ($(evt.target)[0].id !== 'shapebar') return; 
                if ( $bar.hasClass("l-sb") ) $bar.removeClass('l-sb')
                else {
                	$bar.addClass('l-sb')
                }
            })

			var cb = window.colorboard.create(function (value) {
                global._chooseColorCallback && global._chooseColorCallback(value);
                global._chooseColorCallback = null;
                $(global._colorboard).css('display', 'none');
            })
            document.body.appendChild(cb);
            global._colorboard = cb;
            window.colorboard.title(cb, lang.text_shapebar_chooseImageColor);

            global.initPaintingBoard();


		},
		initPaintingBoard : function () {
			var drawingBoard =  new window.DrawingBoard(conf.PATNING_BOARD_HEIGHT, conf.PATNING_BOARD_WIDTH),
				pbElem = drawingBoard.getCanvas(),
				pbContainer = document.createElement('div'),
				$toolBar = $("<div></div>").addClass('painting-board-toolbar'),
				$confirmBtn = $("<div></div>").addClass('painting-board-confirm').addClass('pb-btn').html(lang.text_shapebar_confirm),
				$sizeSelector = $("<select></select>").addClass('painting-board-size').addClass('pb-btn'),
				$colorBtn = $("<div></div>").addClass('painting-board-color').addClass('pb-btn'),
				$eraserBtn = $("<div></div>").addClass('painting-board-eraser').addClass('pb-btn'),
				$fullscreenBtn = $("<div></div>").addClass('painting-board-fullscreen').addClass('pb-btn'),
				$pbPanel  =  $("<div></div>").addClass('painting-board-panel'),
				sizeArr = [1,2,3,4,6,8,10,12,16, 18, 20, 24, 30, 32, 100],
				sizeSelHTML = '';

			function eraserHandler () {
				if ($eraserBtn.hasClass('on')) {
					//取消橡皮擦
					drawingBoard.cancelEraser();
					$eraserBtn.removeClass('on');
				}
				else {
					drawingBoard.setEraser(conf.DEFAULT_ERASER_SIZE);
					$eraserBtn.addClass('on');
				}
			}

			$toolBar.append($sizeSelector).append($colorBtn).append($eraserBtn).append($fullscreenBtn).append($confirmBtn);
			$(pbElem).addClass('painting-board');
			$colorBtn.on('click', function (evt) {
				var clientX = $(pbContainer).find(".painting-board-fullscreen").hasClass('on') ? document.width -  evt.clientX + 20 : null

				global._chooseColor(evt.clientY - $(global._colorboard).offset().height, function (color) {
					global._drawingBoard.setColor(color);
				}, clientX)
			})
			$confirmBtn.on('click', function () {
				var paintingData = pbElem.toDataURL();
				global.hidePaintingBoard();
				sb.notify({
					type : 'addImage',
					data : {
						'shape' : true,
						'value' : paintingData
					}
				})
			})
			function fullscreenPaintBoard () {
				var offset = $("#canvas>.container").offset();
				$("#canvas>.container").append(pbContainer);
				$(pbContainer).css({
					left: -13,
					top: -13,
					// left : offset.left -11,
					// top : offset.top -11,
					right : 'initial'
				})
				$(pbElem).attr('height', offset.height-1).attr('width', offset.width-1);
			}
			$eraserBtn.on('click',  eraserHandler);
			$fullscreenBtn.on('click', function (e) {
				var $target = $(e.target);
				if ($target.hasClass('on')) {
					$("body").append(pbContainer);
					$target.removeClass('on')
					global.resetPaintingBoard();
				}
				else {
					$target.addClass('on')
					fullscreenPaintBoard();
				}
			})

			_.each(sizeArr, function (item) {
				var selected = '';
				if (item === conf.DEFAULT_PAINTING_SIZE) selected = 'selected'
				sizeSelHTML += '<option value=' + item + ' ' + selected + '>' + lang.text_shapebar_fontSize + '-' + item + '</option>';
			})
			$sizeSelector.html(sizeSelHTML)
						 .on('change', function () {
						 	var value = $(this).val()
						 	drawingBoard.drawWidth(value);
						 });
			$(pbContainer).addClass('painting-board-container')
						  .css('zIndex', '100')
						  .append($pbPanel)
						  .append(pbElem)
						  .append($toolBar)
			
			document.body.appendChild(pbContainer);
			drawingBoard.start();
			sb.move($pbPanel[0], pbContainer, {top:true})
			global._drawingBoard = drawingBoard;
			global._drawingBoardContainer = pbContainer;
			global.hidePaintingBoard.call();
		},
		refleshpaintBoard : function () {
			var $con = $(global._drawingBoardContainer);
			if ($("#customShape").hasClass('on') && $con.find('.painting-board-fullscreen').hasClass('on')) {
				var offset = $("#canvas>.container").offset();
				$con.find('canvas').attr('height', offset.height-1).attr('width', offset.width-1);
			}
		},
		addPaintingImage : function () {

		},
		showPaintingBoard : function (clientY) {
			var con = global._drawingBoardContainer,
				$con = $(con);
			if (!con) return;
			$con.removeClass('dp-none');
			$("#customShape").addClass('on')
			setTimeout(function () {
				if (!$con.find(".painting-board-fullscreen").hasClass('on')) {
					$con.data('top' , (clientY - $con.offset().height) + 'px');
					$con.css('top' , clientY - $con.offset().height);
				}
			}, 0)
		},
		resetPaintingBoard : function () {
			var con = global._drawingBoardContainer,
				$con = $(con),
				$canvas = $con.find('canvas');
			if (!con) return;

			setTimeout(function (clientY) {
				$con.css({
					top : $con.data('top'),
					left : 'initial',
					right : conf.PAINTNG_BOARD_RIGHT
				})
				$canvas.attr('height', conf.PATNING_BOARD_HEIGHT).attr('width', conf.PATNING_BOARD_WIDTH)
			}, 0)
		},
		hidePaintingBoard : function () {
			var con = global._drawingBoardContainer,
				$con = $(con);
			if (!con) return;
			$("#customShape").removeClass('on')
			$con.addClass('dp-none');
		},
		//显示取色板
		_chooseColor : function (clientY, callback, clientX) {
			global._chooseColorCallback = callback;
			$(global._colorboard).css('display', 'block').css('top', clientY + 'px').css('right', clientX || '100px')
		},
		destroy : function () {

		},
		enterEditorMode:function(){
            sb.container.style.display = "block";
        },
        enterPreviewMode:function(){
            sb.container.style.display = "none";
            global.hidePaintingBoard();
        }
	}
});