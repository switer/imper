!function (global) {
	var conf = {
		MAOBI_IMAGE : 'url(./img/paintingboard/maobi.png), auto',
		ERASER_IMAGE : 'url(./img/paintingboard/eraser.png), auto',
		DEFAULT_ERASER_COLOR : 'rgba(0,0,0,1)'
	}
	/*@constructor(@param<Number> height, @param<Number> width, [options])*/
	var dw = function (height, width, options) {

		options = options || {};
		var _elem = document.createElement('canvas'),
			context = _elem.getContext('2d'),
			curColor = options.color || 'black',
			curWidth = options.width || 6,
			isEraser = false,
			isAllowDraw = false,
			isInitial = false,
			_confSave = {};

		$(_elem).attr('height', height).attr('width', width)
				.on('selectstart', function () {
					return false;
				}, false)
		//设置画笔的颜色
		this.setColor = function (color) {
			if (isEraser) return;
			curColor = color;
		};
		//设置画笔的笔粗
		this.drawWidth = function (width) {
			// if (isEraser) return;
			curWidth = width;
		};
		//选择橡皮擦
		this.setEraser = function (size) {
			if (!isAllowDraw) return;
			_confSave.curColor = curColor;
			// _confSave.curWidth = curWidth;
			isEraser = true;
			// curWidth = size;
			context.globalCompositeOperation = "destination-out";
			// $(_elem).css('cursor', conf.ERASER_IMAGE)
			// $(_elem).addClass('cursor-er');
		};
		//取消橡皮擦
		this.cancelEraser = function () {
			if (!isAllowDraw) return;
			if (isEraser) {			
				isEraser = false;
				curColor = _confSave.curColor;
				// curWidth = _confSave.curWidth;
				context.globalCompositeOperation = "darker";
				// $(_elem).css('cursor', conf.MAOBI_IMAGE)
				// $(_elem).addClass('cursor-mb');
			}
		}
		//初始化画笔
		function _initializeDrawing () {
			var clicks	= [],
				paint = false,
				_this = this;
			// $(_elem).css('cursor', conf.MAOBI_IMAGE)
			// $(_elem).addClass('cursor-mb');
			context.globalCompositeOperation = "darker";
			$(_elem).on('mousedown', function(e){
				if (!isAllowDraw) return; 
			 	drawStart.call(_elem, e);
			});
			$(_elem).on('mousemove', function(e){
				if (!isAllowDraw) return;
				drawing.call(_elem, e);
			});
			$(_elem).on('mouseup', function(e){
			  paint = false;
			});
			$(_elem).on('mouseout', function(e){
			  paint = false;
			});
			var _offsetLeft,
				_offsetTop;
			function drawStart (e) {
				var _offset = $(_elem).offset();

				_offsetLeft = _offset.left;
				_offsetTop = _offset.top;

				mouseX = e.pageX - _offsetLeft,
				mouseY = e.pageY - _offsetTop;
				paint = true;
				clicks.push({x : mouseX, y:mouseY, dragging : false});
				if(isEraser){
					draw(conf.DEFAULT_ERASER_COLOR,curWidth);
				}else{
					draw(curColor,curWidth);
				}
			}
			function drawing (e) {
				if(paint){
					clicks.push({x:e.pageX - _offsetLeft, y:e.pageY - _offsetTop, dragging: true}
				);
				if(isEraser){
					draw(conf.DEFAULT_ERASER_COLOR,curWidth);
				}else{
					draw(curColor,curWidth);
				}
				}
			}
			function draw(color,width){
			  context.strokeStyle =color;
			  context.lineJoin = "round";
			  context.lineWidth = width;
			  context.beginPath();
			  var len=clicks.length;
			  if(clicks[len-1].dragging){
			  	context.moveTo(clicks[len-2].x,clicks[len-2].y);
			  	context.lineTo(clicks[len-1].x,clicks[len-1].y);
			  }else{
			  	context.moveTo(clicks[len-1].x-1,clicks[len-1].y);
			  	context.lineTo(clicks[len-1].x,clicks[len-1].y);
			  }
			  context.closePath();
			  context.stroke();
			}
		} 
		this.getCanvas = function () {
			return _elem;
		};
		this.start = function () {
			isAllowDraw = true;
			if (!isInitial) {
				_initializeDrawing.call(this);
				isInitial = true;
			} else {
				// _confSave.tool && $(_elem).css('cursor', _confSave.tool)

			}
		}
		this.stop = function () {
			isAllowDraw = false;
			// _confSave.tool = $(_elem).css('cursor')
			// $(_elem).css('cursor','initial')
			$(_elem).addClass('cursor-init');
		}
		
	};
	global.DrawingBoard = dw;
}(window);