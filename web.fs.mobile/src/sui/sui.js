
/*ui.popbox.js*/
!function ($) {

  var conf = {
    "mask_class" : 'sui-popbox-mask',
    'hide_class' : 'sui-disp-none',
    'box_sel' : ".sui-popbox-box",
    "delay_time" : 100
  }
  var _timer, _this = {};
  $.fn.checkPosition = function () {
    setInterval(function () {
      $box.data('top') && $box.css('top', parseInt($box.data('top')) + document.body.scrollTop);
    }, conf.delay_time);
  }
  $.fn.trantision = function () {
    $(this).css('webkitTransition', 'top 1s');
  }
  /**
  * 显示弹框，并设置高度
  */
  $.fn.showPopbox = function () {
    var $popbox = $(this),
        box = $popbox.find(conf.box_sel)[0];
    _this.$popbox = $popbox;
    $popbox.suiShow();
    //定高
    var height =  document.body.scrollHeight;
    $popbox.height(height);
    //定时校验机制, 一次延时校验
    function _fixedHeight() {
      height =  document.body.scrollHeight;
      if ( height !== $popbox.height() ) $popbox.height(height);
    }
    setTimeout(_fixedHeight, 100);
    /*根据data配置数据*/
    if ( $popbox.data('vertical') === 'center' ) {
      $popbox.center();
    }
    if ( $popbox.data('position') === 'fixed' && $popbox.data('setPosition') !== 'fixed' ) {
      $popbox.data('setPosition', 'fixed');
      $popbox.fixed();
    }
    $popbox.data('transition') && box && (box.style['webkitTransition'] = 'top 1s');
    
  }
  $.fn.fixed = function (e) {
    var $popbox = $(this),
        $box = $popbox.find('.sui-popbox-box');
    function scrollHandler (event) {
      if (!$box.data('top') ) {
        $box.data('top', $box.offset()['top'])
      } 
      $box.css('top', parseInt($box.data('top')) + document.body.scrollTop);
    }
    window.addEventListener('scroll', scrollHandler);
    scrollHandler();
  }
  $.fn.center = function () {
    var $popbox = $(this),
        $box = $popbox.find('.sui-popbox-box'),
        diffHeight = $(window).height() - $box.height(),
        top = diffHeight <= 0 ? 0 : diffHeight / 2;
    $box.data('top', top);
    //有fixed定位就让fixed方法来定位
    $popbox.data('position') !== 'fixed' && $box.css('top', top + 'px');
  }
  $(document).on('click.sui-popbox>.sui-popbox-mask', function (e) {
    var $mask = $(e.target),
        $parent = $mask.parent();
    if ( !$mask.hasClass(conf.mask_class) ) return;
    if ($parent.data('cancel')) {

      //防止事件透传, 采用delay隐藏
      $parent.delayHide();
    }
    //防止事件透传，停止默认事件与冒泡
    e.preventDefault();
    e.stopPropagation();
    return false;
  });
  //停止滚动, 在Android2.1停止scroll会无效
  $(document).on('touchmove.sui-popbox', _scrollHandler);

  function _scrollHandler (e) {
    
    var $parent = $(e.target).parent();

    if (!$parent.hasClass('sui-popbox')) return;

    if ( $parent 
        && !$parent.isHide() 
          && $parent.data('noscroll') ) {

      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }
}(window.$);
/*ui.input.js*/
!function ($) {

  var conf = {};
  /*Input public method*/
  $.fn.flushInp = _fulshInput;

  $(document).on('click.sui-inp', _fulshInput);

  /*flush Placeholder*/
  function _fulshInput (e) {
    
    var $inp = $(e.target);
    if( _isEmpty( $inp.val() ) ) {
        $( event.target ).val( '' );
    }
  }
  //String is empty
  function _isEmpty(val) {
    return (val === undefined || val === null || val.length === 0);
  }
}(window.$);
/*ui.button.js*/
!function ($) {

  var conf = {
    "feed_time" : 250,
    "feed_class" : 'sui-no-feed',
    "disabled" : 'sui-disabled',
    "nav_btn" : 'sui-btn-nav',
    "nav_on" : 'sui-on',
    "button" : '.sui-btn'
  }
  $.fn.toggle = function  (time, callback) {
    var $this = this;
    $this.disabled();
    if ( time && time !== 0 ) {
      setTimeout (function () {
        $this.enabled();
        callback && callback.apply($this);
      }, time);
    }
  }
  $.fn.enabled = function () {
    $(this).removeClass(conf.disabled);
  }
  $.fn.disabled = function () {
    $(this).addClass(conf.disabled)
  }
  /**
  * @return bool 
  **/
  $.fn.isdisabled = function () {
    return $(this).hasClass(conf.disabled);
  }
  $.fn.feed = function () {
    $(this).removeClass(conf.feed_class);
  }
  $.fn.unFeed = function () {
    $(this).addClass(conf.feed_class)
  }
  /**
  * Button Event
  **/
  $(document).on('click.sui-btn', function (e) {

    var $btn = $(e.target);
        $btn.feed();

    //按钮处于disabled状态
    if ($btn.isdisabled()) return;

    //检查按钮的toggle配置
    var toggle = $btn.attr('data-toggle'),
        $parent = $btn.parent();
        isNavBtn = $parent ? $btn.parent().hasClass(conf.nav_btn) : false;

    //改按钮配置了toggle属性
    if (toggle) {
      //disabled开关
      $btn.toggle(parseInt(toggle));
    }
    //取消默认反馈
    setTimeout(function () {
      $btn.removeClass(conf.feed_class);
    }, conf.feed_time);

    if (isNavBtn) {
      $parent.find(conf.button).removeClass(conf.nav_on);
      $btn.addClass(conf.nav_on);
    }
  })
}(window.$);
/*ui.base.js*/
!function ($) {

  var conf = {
    'hide_class' : 'sui-disp-none',
    "delay_time" : 100
  }
  //public method
  $.fn.delayHide = function () {
    var $sui = $(this);
    setTimeout(function () {
      $sui.suiHide();
    } , conf.delay_time);
  }
  $.fn.isHide = function () {
    return $(this).hasClass(conf.hide_class);
  }
  $.fn.suiHide = function () {
    var $sui = $(this);
    $sui.addClass(conf.hide_class);
  }
  $.fn.suiShow = function () {
    $(this).removeClass(conf.hide_class);
  }
}(window.$);