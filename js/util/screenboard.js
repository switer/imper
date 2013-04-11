!function (global) {

	var sb = {};
	global.screenBoard = sb;

	sb.create = function () {
		var scales = ['16:9', '8:5',"6:5", "5:3", "4:3", '2:1', '1:1'],
			scaleElem, 
			$scaleElem,
			closeMenu = document.createElement('div'),
			board = document.createElement('div');

		closeMenu.className = 'close-menu';
		board.className = 'panel1 screen-box';
		$(closeMenu).attr('style', 'top:-10px;right:-10px').on('click', function (e) {sb.hide(board);})
		$(board).attr('style', 'left: 90px;top:20px');
		for (var i = 0; i < scales.length;i ++) {
			scaleElem = document.createElement('div');
			$scaleElem = $(scaleElem);
			scaleElem.className = 'screen-scale';
			$scaleElem.data('value', scales[i]).html(scales[i]);
			$(board).append(scaleElem);
		}
		$(board).append(closeMenu);
		return board;
	}
	
	sb.listen = function (elem, callback) {
		$(elem).on('click .screen-scale', function (e) {
			var $tar = $(e.target)
			if ( !$tar.hasClass('screen-scale') ) return;
			var value = $tar.data('value');
			callback && callback.call(global, value);
		});
	}
	sb.isHide = function (elem) {
		return ($(elem).data('hide') === 'true');
	}
	sb.hide = function (elem) {
		$(elem).data('hide', 'true');
		$(elem).hide()
	}
	sb.show = function (elem) {
		$(elem).data('hide','false');
		$(elem).show()
	}
	sb.toggle = function (elem) {
		if ( sb.isHide(elem) ) sb.show(elem);
		else sb.hide(elem);
	}
}(window)