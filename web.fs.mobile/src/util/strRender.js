define(function () {
	function _replace (collection, str) {
		var regs = [];
		_.each(collection, function (item, key) {
			regs.push({key : new RegExp('@\{' + key + '\}', 'g'), value: item});
		})
		for (var i = regs.length - 1; i >= 0; i--) {
			str = str.replace(regs[i]['key'], regs[i]['value']);
		};
		return str;
	}
	return {
		replace : _replace
	}
});

	