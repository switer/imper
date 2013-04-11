var util = {
    
    log:function(msg){
        console.log(msg);
    },
    /*
     *provides a method to load image
     *
     *@return {Image} 
     */
    imageLoder:function(obj){
        var image  = new Image();
        if(obj){
            //ie
            if (window.navigator.userAgent.indexOf("MSIE")>=1){
                obj.select();
                // IE下取得图片的本地路径
                image.src = document.selection.createRange().text;
            }
            //非IE类浏览器暂时兼容firefox，chrome or opera?or safary? or mobile brower?
            else{
                if(obj.files){
                    var reader = new FileReader();
                    reader.onerror = function(e){
                        log.log(e.message);
                    }
                    reader.readAsDataURL(obj.files.item(0));
                    reader.onload = function(){
                        image.src = reader.result;
                    };
                }
            }
            return image;
        }
        return null;
    }
};
