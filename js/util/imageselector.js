/**
*	依赖于sandbox的readFileData
**/
!function () {
	var ImageSelector = {};
	window.ImageSelector = ImageSelector;
	ImageSelector.create = function (sandbox, callback, empty) {
		var ISBox 		= document.createElement('div'),
			closeMenu 	= document.createElement('div'),
			IFBox 		= document.createElement('div'),
			IFSelector 	= document.createElement('input'),
			ImgPreview 	= document.createElement('div'),
			ImgEmpty 	= document.createElement('div'),
			_imageData = null;

		$(ISBox).addClass("panel1").addClass("image-select-box").css({
			top : "100px",
			left : "100px"
		});
		$(closeMenu).addClass("close-menu")
		$(IFBox).addClass("image-file-box")
		$(IFSelector).addClass("image-file-select").attr('type', 'file')
		$(ImgPreview).addClass("image-preview")
		$(ImgEmpty).addClass("image-empty")

		$(IFBox).append(IFSelector);
		$(ISBox).append(closeMenu).append(IFBox).append(ImgPreview).append(ImgEmpty);
		$(ImgPreview).on('click', function () {
			callback && callback('url(' + _imageData + ')');
		})
		$(IFSelector).on('change', function (data) {
			sandbox.readFileData(IFSelector, function (data) {
				$(ImgPreview).css('backgroundImage','url(' + data + ')');
				_imageData = data
			})
		})
		$(closeMenu).on('click', function () {
			$(ISBox).boxHide();
		})
		$(ImgEmpty).on('click', function () {
			empty && empty();
		})
		ImageSelector._sb = sandbox;
		return ISBox;
	}
	$.fn.boxHide = function () {
		$(this).addClass('dp-none')
	}
	$.fn.boxShow = function () {
		$(this).removeClass('dp-none')
	}

} ()