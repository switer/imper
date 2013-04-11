Core.registerModule("shapebar", function(sb){

    var conf = {
    		PATNING_BOARD_HEIGHT : 300,
    		PATNING_BOARD_WIDTH : 300,
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
                "windowResize":this.windowResize 
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
                else $bar.addClass('l-sb');
            })

			var cb = window.colorboard.create(function (value) {
                global._chooseColorCallback && global._chooseColorCallback(value);
                global._chooseColorCallback = null;
                $(global._colorboard).css('display', 'none');
            })
            document.body.appendChild(cb);
            global._colorboard = cb;
            window.colorboard.title(cb, '请选择图形颜色');

            global.initPaintingBoard();


		},
		initPaintingBoard : function () {
			var drawingBoard =  new window.DrawingBoard(conf.PATNING_BOARD_HEIGHT, conf.PATNING_BOARD_WIDTH),
				pbElem = drawingBoard.getCanvas(),
				pbContainer = document.createElement('div'),
				$toolBar = $("<div></div>").addClass('painting-board-toolbar'),
				$confirmBtn = $("<div></div>").addClass('painting-board-confirm').addClass('pb-btn').html('确定'),
				$sizeSelector = $("<select></select>").addClass('painting-board-size').addClass('pb-btn'),
				$colorBtn = $("<div></div>").addClass('painting-board-color').addClass('pb-btn'),
				$eraserBtn = $("<div></div>").addClass('painting-board-eraser').addClass('pb-btn'),
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

			$toolBar.append($sizeSelector).append($colorBtn).append($eraserBtn).append($confirmBtn);
			$(pbElem).addClass('painting-board');
			$colorBtn.on('click', function (evt) {
				global._chooseColor(evt.clientY, function (color) {
					global._drawingBoard.setColor(color);
				})
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
			$eraserBtn.on('click',  eraserHandler);

			_.each(sizeArr, function (item) {
				var selected = '';
				if (item === conf.DEFAULT_PAINTING_SIZE) selected = 'selected'
				sizeSelHTML += '<option value=' + item + ' ' + selected + '>笔粗-' + item + '</option>';
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
		addPaintingImage : function () {

		},
		showPaintingBoard : function (clientY) {
			var con = global._drawingBoardContainer,
				$con = $(con);
			if (!con) return;
			$con.removeClass('dp-none');
			$("#customShape").addClass('on')
			setTimeout(function () {
				$con.css('top', (clientY - $con.offset().height) + 'px')
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
		_chooseColor : function (clientY, callback) {
			global._chooseColorCallback = callback;
			$(global._colorboard).css('display', 'block').css('top', clientY + 'px').css('right', '100px')
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