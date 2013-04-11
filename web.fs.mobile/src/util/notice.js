define(function () {
	function showMsg (msg) {
		var msgbox = document.createElement('div');
			msgbox.innerHTML = msg;
		msgbox.style.position = "absolute";
		msgbox.style.top = "0px";
		msgbox.style.border = "1px solid black";
		msgbox.style.boxShadow = "2px 2px 20px black";
		msgbox.style.height =  "50px";
		msgbox.style.lineHeight =  "50px";
		msgbox.style.padding =  "10px";
		document.body.appendChild(msgbox)
		setTimeout(function () {
			document.body.removeChild(msgbox);
		},1000);
	}
	return {
		msg : showMsg
	}
})