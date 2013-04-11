!function (global) {

	var sb = {};
	global.ChooseBox = sb;

	sb.create = function (chooseItems) {
		var scales = chooseItems,
			scaleElem, 
			$scaleElem,
			closeMenu = document.createElement('div'),
			board = document.createElement('div');

		closeMenu.className = 'close-menu';
		board.className = 'panel1 choose-box';
		$(closeMenu).attr('style', 'top:-10px;right:-10px').on('click', function (e) {sb.hide(board);global._closeCallback && global._closeCallback();})
		$(board).attr('style', 'left: 90px;top:50px');
		for (var i = 0; i < scales.length;i ++) {
			scaleElem = document.createElement('div');
			$scaleElem = $(scaleElem);
			scaleElem.className = 'choose-item';
			$scaleElem.data('value', scales[i].value).html(scales[i].key);
			$(board).append(scaleElem);
		}
		$(board).append(closeMenu);
		return board;
	}
	
	sb.listen = function (elem, callback) {
		$(elem).on('click .choose-item', function (e) {
			var $tar = $(e.target)
			if ( !$tar.hasClass('choose-item') ) return;
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
	sb.onClose = function (callback) {
		global._closeCallback = callback;
	}
}(window)