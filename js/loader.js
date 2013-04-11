define('loader', ['../web.fs.mobile/src/webfs'], function (wfs) {
	document.getElementById('appContainer').className = 'dp-none';
	if (!bowser.webkit) {
		var body = document.body;
		body.style.backgroundColor = 'black';
		body.style.overflow = 'hidden';
		var mask = document.getElementById('mask');
		mask.className = '';
		mask.style.height =  document.documentElement.clientHeight + 'px';
	} else {
		$('#appContainer').removeClass('dp-none');
		window.altbox.start();
	    Core.startAll();
	}
});