(function (global) {
	global.colorboard = {};
	global.colorboard.create =  function (cmdCall) {

			var colorSelector = document.createElement("div"),
		        general_list = document.createElement("div"),
		        standard_list = document.createElement("div"),
		        color_list = document.createElement("div"),
		        title = document.createElement("center"),
		        closeMenu = document.createElement("div");

	        title.className = 'colorboard_title';
	        closeMenu.className = 'close-menu';
	        colorSelector.className = 'colorSelector';
	        $(colorSelector).attr('style',"display: none;position: absolute;width: 190px;height: 170px;top: 50px;right: 0px;background-color: #FAFAFA;border-radius: 2px;border: 1px solid black;z-index: 999;-webkit-transition:top 0.3s;");
	        $(general_list).attr('style',"width: 170px;margin: 10px 10px;height: 14px;");
	        $(standard_list).attr('style',"width: 170px;margin: 10px 10px;height: 14px;");
	        $(color_list).attr('style',"width: 170px;margin: 10px 10px;height: 70px;");
	        $(title).attr('style',"width: 100%;height: 16px;");
	        $(closeMenu).attr('style', 'top:-10px;right:-10px')
	        var generalColor = ['#ffffff','#000000','#EEECE1','#1F497D','#4F81BD','#C0504D',
	        '#9BBB59','#8064a2','#4BACC6','#F79646'];
	        var standardColor = ['#C00000','#ff0000','#FFC000','#ffff00','#92D050','#00B050',
	        '#00B0F0','#0070C0','#002060','#7030A0'];
	        var color = [0xF2F2F2,0x7F7F7F,0xDDD9C3,0xC6D9F0,0xDBE5F1,0xF2DCDB,0xEBF1DD,
	        0xE5E0EC,0xDBEEF3,0xFDEADA];
	        var color2 = [0x7F7F7F,0x0C0C0C,0x1D1B10,0x0F243E,0x244061,0x632423,0x4F6128,
	        0x3F3151,0x205867,0x974806];
	        var len = generalColor.length,color_len = 5,i,j,strong;
	        for ( i= 0; i < len; i++) {
	            strong = document.createElement("a");

	            strong.href = "javascript:;";
	            strong.style.backgroundColor = generalColor[i];
	            general_list.appendChild(strong);
	            strong.addEventListener("click", function(e){
	                // document.execCommand(execCType.value,false,e.currentTarget.style["backgroundColor"]);
	                cmdCall && cmdCall.call(global, e.currentTarget.style["backgroundColor"]);
	            }, false);
	            strong = document.createElement("a");
	            strong.href = "javascript:;";
	            strong.style.backgroundColor = standardColor[i];
	            standard_list.appendChild(strong);
	            strong.addEventListener("click", function(e){
	                cmdCall && cmdCall.call(global, e.currentTarget.style["backgroundColor"]);
	            }, false);
	        }
	        for (i = 0; i < color_len; i++) {
	            for (j = 0; j < len; j++) {
	                strong = document.createElement("a");
	                strong.href = "javascript:;";
	                /*分割第一组16进制颜色数据*/
	                var colordiv =  [parseInt(color[j]/0x10000),parseInt(color[j]/0x100)%0x100,parseInt(color[j])%0x100];
	                /*分割第二组16进制颜色数据*/
	                var colordiv2 =  [parseInt(color2[j]/0x10000),parseInt(color2[j]/0x100)%0x100,parseInt(color2[j])%0x100];
	                /*比较两组分割的差值*/
	                var diffs = [((colordiv[0]-colordiv2[0])/4),((colordiv[1]-colordiv2[1])/4),((colordiv[2]-colordiv2[2])/4)];
	                /*计算背景色*/
	                var bgcolor =  parseInt(parseInt(colordiv[0]-diffs[0]*i)*0x10000+parseInt(colordiv[1]-diffs[1]*i)*0x100+parseInt(colordiv[2]-diffs[2]*i));
	                /*hack为颜色数据长度必须为6位*/
	                var colorstr = bgcolor.toString(16);
	                if(colorstr.length<6) colorstr = "0"+colorstr;
	                strong.style.backgroundColor = "#"+colorstr;
	                color_list.appendChild(strong);
	                strong.addEventListener("click", function(e){
	                    cmdCall && cmdCall.call(global, e.currentTarget.style["backgroundColor"]);
	                }, false);
	            }
	        }

	        var frag = document.createDocumentFragment();
	        frag.appendChild(general_list);
	        frag.appendChild(color_list);
	        frag.appendChild(standard_list);
	        frag.appendChild(title)
	        frag.appendChild(closeMenu)
	        colorSelector.appendChild(frag);
	        $(colorSelector).find('.close-menu').on('click', function () {
				$(colorSelector).css('display', 'none');
			})
	        return colorSelector;
	},
	global.colorboard.title = function (elem, title) {
		$('.colorboard_title', elem).html(title);
	}
		
})(window)