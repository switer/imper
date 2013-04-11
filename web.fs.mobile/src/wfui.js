!function () {
	var conf = {
		'icon_sel' : ".fs-icon"
	}
	$(document.body).on('touchstart mousedown', conf.icon_sel, function (e) {
		var $target = $(e.target), $parent;
		if ( $target.hasClass('fs-icon') ) $parent = $target;
		else if ( $target.hasClass('fs-icon-img') || $target.hasClass('fs-icon-name') ) $parent = $target.parent();
		else if ( $target.hasClass('fs-icon-opt') ) $parent = $target;
		if ($parent) {
			$parent.css('background-color', 'steelblue');
			setTimeout(function () {
				$parent.css('background-color', 'white');
			}, 300);
		}
			
	})
	$(document.body).on('touchstart mousedown',  function (e) {
		var $target = $(e.target), $parent;
		if ( $target.data('feed') ) $parent = $target;
		if ($parent) {
			$parent.addClass('fs-feed-effect');
			setTimeout(function () {
				$parent.removeClass('fs-feed-effect');
			}, 300);
		}
			
	})
}();
