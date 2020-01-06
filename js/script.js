
var resizeTimer = 0;

jQuery(document).ready(function($) {

  $('a[href="#"]').click(function(event){
    event.preventDefault();
  });



  $( window ).on( "orientationchange", function( event ) {
    //if(iSlider) iSlider.after();
  });

	$(window).load(function(){
    //$('<span class="winwid"></span>').appendTo('.logo-div'); // remove on release
    //$('.winwid').text( $(window).width() ); // remove on release

    if( $('.inews-img').length ) { // плитка новостей на индексной, строим
      var iHeight = 0;
      $('.inews-img').each(function(){
        iHeight = $(this).children('img').eq(0).removeAttr("height").css({ height: "" }).height();
        $(this).children('img').eq(0).data('originalh', iHeight);
        $(this).css({height: iHeight + 'px'} );
      });



    } // -- плитка новостей на индексной, строим /
    alignIndexNews();

	}); // --- window.load
//----------------------------------------------------------------------------------------
	$(window).resize(function(){
    //$('.winwid').text( $(window).width() ); // remove on release

    $('.popup:visible').center();

      clearTimeout(resizeTimer);
			resizeTimer = setTimeout(alignIndexNews, 500);

	}); // --- window.resize

//----------------------------------------------------------------------------------------
	$(window).scroll(function(){
		 	$('.popup:visible').center();
	}); // --- window.scroll

//----------------------------------------------------------------------------------------
  function alignIndexNews() {
    if( $('.inews-img').length ) {
      var $container = $('.index-news-tile');
      $container.masonry({
        // columnWidth: 200,
        gutter: 0,
        //isFitWidth: true,
        isResizeBound: true,
        itemSelector: '.index-news'
      });
    }

      if( $('.other-actions .row').length ) {
        var maxH = 0;
        $('.other-actions .row').each(function(){
            maxH = $(this).height() -220;
            $(this).find('figure').height(maxH);
        });
      }

      if( $('.col-2-3').length ) {
        var thH = $('.col-2-3').height();
        if( $('.col-1-3').height() < thH ) $('.col-1-3').height(thH);
      }


  }



  if( $('.bd-img').length ) {
    var thSrc = false;
    $('.bd-img').each(function(){
      thSrc = $(this).children('img').attr('src');
      $(this).children('img').hide();
      $(this).css('backgroundImage', 'url('+thSrc+')');
    });
  }



  if( $('.inews-img').length ) { // картинки в анонсах на индексной, увеличение

    var inewsImg = false;
    var inewsOrg = false;
    var animHeight = false;
    $('.index-news').mouseenter(function(){
      inewsImg = $(this).find('img').eq(0);
      if(inewsImg) {
        //$(inewsImg).css('max-width', 'auto');
        inewsOrg = $(inewsImg).data('originalh');
        animHeight = inewsOrg + 25;
        $(inewsImg).animate({
          height: animHeight,
        }, 250, 'linear', function() {

        });
      }
    }).mouseleave(function(){
       if(inewsImg) {

        $(inewsImg).animate({
          height: inewsOrg,
        }, 150, 'linear', function() {
          //$(inewsImg).css('max-width', '100%');
        });
       }
    });
  } // -- картинки в анонсах на индексной, увеличение /

//----------------------------------------------------------------------------------------
	if( $('.hero-slider').length ) { // если слайдер на индексной
  /*
		var thSrc = false;
		$('.goods-slider .picture').each(function(){
      thSrc = $(this).children('img').attr('src');
      $(this).children('img').hide();
      $(this).css('backgroundImage', 'url('+thSrc+')');
		});
*/
		  function slideCount() {
		    // var flView = $('.flex-viewport').width();
				var flView = $('.profile-right').width();
				return (flView <= 435) ? 2 :
           (flView <= 520) ? 2 : 3;

		  }

		var inxSlider = $('.hero-slider').flexslider({
		    animation: "slide",
				slideshow: false,
		    animationLoop: true,
				controlNav: false,
				directionNav: false,
				manualControls: 'a.hsl-move',
				pauseOnHover: true,
				move: 1,
		    itemWidth: 180,
		    itemMargin: 0,
	      minItems: slideCount(),
	      maxItems: slideCount(),
				//minItems: 1,
        start: function(slider){
            $(inxSlider).resize();
        },
        after: function(slider){
            $(inxSlider).resize();
        },
        before: function(slider){
            $(inxSlider).resize();
        }
		});

        $('a.hsl-move').on('click', function(){
          if( $(this).attr('rel') == 'prev' ) {
  					$(inxSlider).flexslider('prev');
            return false;
          } else {
  					$(inxSlider).flexslider('next');
            return false;
          }
					return false;
        });

	} // -- если слайдер на индексной

  if( $('.load-photo-link a').length ) {
    var uplButton = $('.load-photo-link a');

		$.ajax_upload(uplButton, {
         action : '/',
         name : 'myfile',
         data : { 'token': 'qwertyuiio' },
         onSubmit : function(file, ext) {
           // показываем картинку загрузки файла
          // $("img#load").attr("src", "load.gif");
           $("#regPhoto").text('Загрузка...');

           /*
            * Выключаем кнопку на время загрузки файла
            */
           this.disable();

         },
         onSuccess : function(file) {
         	//$("#regPhoto").text('Заменить');
         	//$('a.cross').css('display', 'block').css('z-index', 17);
         },
         onError: function(file, response){
         	//$("#regPhoto").text('Загрузить фотографию');
         },
         onComplete : function(file, response) {
           // убираем картинку загрузки файла
           // $("#regPhoto").text('Заменить');
			     // что-то проделываем в зависимости от response

           // снова включаем кнопку
           this.enable();

           // показываем что файл загружен
          // $("<li>" + file + "</li>").appendTo("#files");

         }
      });
  }

  $('a.del-photo').click(function(){
    var thId = $(this).data('photo');
    alert('delete photo id = '+thId);
    // удаляем фото
    $(this).closest('div').remove();
  });

  if(($('#reg-form').length)&& ($.fn.styler)) {
    $('#reg-form select').styler();
  }

  if(($('.my-photos').length)&& ($.fn.colorbox)) {
    $('.my-photos .colorbox').colorbox({slideshow: true, loop:true, preloading:true, maxWidth:'93%', maxHeight:'93%', scrolling:false, slideshowSpeed:5000, rel:'myphoto'});
  }

  if(($('.profile-photo-list').length)&& ($.fn.colorbox)) {
    $('.profile-photo-list .colorbox').colorbox({slideshow: true, loop:true, preloading:true, maxWidth:'93%', maxHeight:'93%', scrolling:false, slideshowSpeed:5000, rel:'myphoto'});
  }

  if( $('article').length ) {
    $('article h1 + p').each(function(){
      if( $(this).text = '' ) $(this).hide(); // скрывает первый после h1 абзац в article, если он пустой
    });
  }


  try {
   $.cartonbox();
	} catch (exception_var) {
	   //catch_statements
	} finally {
	   //finally_statements
	};

  $('.find-link').click(function(){
    if( $('.search-row:visible').length ) {
      $(this).removeClass('opened');
      $('.search-row').hide(150);
    } else {
      $(this).addClass('opened');
      $('.search-row').show(150);
    }
  });

  $('.mess-example').on('click', function(){ // это пример
      $.ajax({
        url: '_message_box.html',
        type: 'GET',
        dataType: 'html',
        success: function(data) {
          $('#dlgOverlap').show();
          $('#dlgBox').html(data).show().center();
        }
      });
    return false;
  }); // -- демо попап-формы авторизации

  $('.popup-example').on('click', function(){ // это пример
      $.ajax({
        url: '_login_form.html',
        type: 'GET',
        dataType: 'html',
        success: function(data) {
          $('#dlgOverlap').show();
          $('#dlgBox').html(data).show().center();
        }
      });
    return false;
  }); // -- демо попап-формы авторизации

  $('#dlgOverlap, .popup-close').on('click', function(){
    $('#dlgOverlap').hide();
    $('.popup').hide();
  });

}); // -- document.ready /

//----------------------------------------------------------------------------------------
jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", Math.max(0, (($(window).height() - this.height()) / 2) +  $(window).scrollTop() -10) + "px");
    this.css("left", Math.max(0, (($(window).width() - this.width()) / 2) + $(window).scrollLeft()) + "px");
    return this;
}






















