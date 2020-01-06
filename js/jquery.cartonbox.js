(function($) {
	
	$.cartonbox = function(options) {

		// Настройки
		var settings = $.extend({
			// Options
			wrap: '',
			source: 'cartonbox',
			speed: 200,
			nav: false,
			cycle: false,
			
			// Callbacks
			onStartBefore: function() {},
			onStartAfter: function() {},
			onLoadBefore: function() {},
			onLoadAfter: function() {},
			onShowBefore: function() {},
			onShowAfter: function() {},
			onClosedBefore: function() {},
			onClosedAfter: function() {},
			onLeft: function() {},
			onRight: function() {},
			onError: function() { alert('Не удалось загрузить данные!'); }
		}, options);
		
		// Оборачиваем весь контент в блок
		if (!$('.cartonbox-body').length) {
			if (settings.wrap == '') $('body').wrapInner('<div class="cartonbox-body"></div>');
			else $(settings.wrap).wrap('<div class="cartonbox-body"></div>');
		}
		
		// Добовляем бэк
		if (!$('.cartonbox-back').length) $('<div class="cartonbox-back"></div>').insertAfter('.cartonbox-body');
		
		// Добовляем анимацию загрузки
		if (!$('.cartonbox-preloader').length) $('<div class="cartonbox-preloader"></div>').insertAfter('.cartonbox-back');
		
		// Добавляем обертку для модального окна,
		// блок для контента,
		// кнопку закрытия
		// стрелки влево-вправо
		// и навигацию
		if (!$('.cartonbox-wrap').length) {
			$('<div class="cartonbox-wrap">' +
			   	   '<div class="cartonbox-container">' +
				   	   '<div class="cartonbox-content"></div>' +
				   '</div>' +
				   '<div class="cartonbox-close"></div>' +
				   '<div class="cartonbox-left"></div>' +
				   '<div class="cartonbox-right"></div>' +
				   '<div class="cartonbox-nav"></div>' +
			  '</div>').insertAfter('.cartonbox-preloader');
		}
		
		// Ищем групповые ссылки
		// и добавляем индекс
		$('.' + settings.source).each(function() {
			if ($(this).data('cb-group') && !$(this).attr('data-cb-group-index')) {
				$('.' + settings.source + '[data-cb-group=' +  $(this).data('cb-group') + ']').each(function(i) {
					$(this).attr('data-cb-group-index', i);
				});
			}
		});
		
		// Запуск из Hash
		var cpHash = window.location.hash;
		if (cpHash != '' && cpHash != '#') {
			cpHash = cpHash.replace('#', '');
			if ($('.' + settings.source + '[data-cb-hash=' +  cpHash + ']').length) {
				$('.cartonbox-body').data('cb-source', settings.source);
				cbFuncStart($('.' + settings.source + '[data-cb-hash=' +  cpHash + ']'));
			}
		}
		
		// Работа по клику
		$('.' + settings.source).on('click', function() {
			$('.cartonbox-body').data('cb-source', settings.source);
			cbFuncStart($(this));
			return false;
		});
		
		// Работа по клику влево/вправо или при клике по навигации
		$('.cartonbox-wrap').on('click', '.cartonbox-left a, .cartonbox-right a, .cartonbox-nav li:not(.active) a', function() {
			if ($(this).parent().hasClass('cartonbox-left')) settings.onLeft();
			if ($(this).parent().hasClass('cartonbox-right')) settings.onRight();
			
			// Загрузка контента
			cbFuncContent($(this));
			
			return false;
		});
		$('.cartonbox-wrap').on('click', '.cartonbox-nav .active a', function() {
			return false;
		});
		
		// Навигация по стрелкам
		$(window).on('keydown', function(e) {
			if ($('.cartonbox-on').length) {
				if (e.which == 37) { // left
					if ($('.cartonbox-left a').length) {
						settings.onLeft();
						cbFuncContent($('.cartonbox-left a'));
					}
				} else if (e.which == 39) { // right
					if ($('.cartonbox-right a').length) {
						settings.onRight();
						cbFuncContent($('.cartonbox-right a'));
					}
				}
			}
		});
		
		// Ресайз окна браузера
		$(window).on('resize', function() {
			cbFuncCenter();
		});
		
		// Функция первого запуска окна
		function cbFuncStart(cbThis) {
			settings.onStartBefore();
			
			// Делаем кишки неподвижными
			var cbScrollTop = $(window).scrollTop();
			$('.cartonbox-body').data('cb-top', cbScrollTop).css({
				'position': 'fixed',
				'top': -cbScrollTop,
				'left': 0,
				'right': 0,
				'bottom': 0,
				'overflow': 'hidden'
			}).addClass('cartonbox-on');
			
			// Показываем бэк
			$('.cartonbox-back').fadeIn(settings.speed);
			
			// Навигация
			if (cbThis.data('cb-group') && cbThis.data('cb-group') != '' && settings.nav == 'dotted') {
				var cbGroupTotal = $('.' + settings.source + '[data-cb-group=' +  cbThis.data('cb-group') + ']').length;
				var cbNav = '';
				for (var i = 0; i < cbGroupTotal; i++) {
					var cbNavLink = $('.' + settings.source + '[data-cb-group=' + cbThis.data('cb-group') + '][data-cb-group-index=' + i + ']');
					var cbNavHref = cbNavLink.attr('href');
					var cbNavType = cbNavLink.data('cb-type');
					var cbNavCaption = cbNavLink.data('cb-caption');
					var cbNavHash = cbNavLink.data('cb-hash');
					var cbNavDesign = cbNavLink.data('cb-design');
					cbNav = cbNav + '<li><a href="' + cbNavHref + '" class="' + settings.source + '" data-cb-type="' + cbNavType + '" data-cb-group="' + cbThis.data('cb-group') + '" data-cb-group-index="' + i + '"' + (cbNavCaption && cbNavCaption !="" ? ' data-cb-caption="' + cbNavCaption + '"' : '') + '' + (cbNavHash && cbNavHash !="" ? ' data-cb-hash="' + cbNavHash + '"' : '') + '' + (cbNavDesign && cbNavDesign !="" ? ' data-cb-design="' + cbNavDesign + '"' : '') + '></a></li>';
				}
				$('.cartonbox-nav').html('<ul class="cartonbox-nav-dotted">' + cbNav + '</ul>');
				$('.cartonbox-nav').show();
			}
			
			settings.onStartAfter();
			
			// Загрузка контента
			cbFuncContent(cbThis);
		}
		
		// Функция загрузки контента
		function cbFuncContent(cbThis) {
			if ($('.cartonbox-body').data('cb-source') == settings.source) {
				cbFuncArrows(cbThis);
				
				// Переключаем на нужную позицию в навигации
				if ($('.cartonbox-nav-dotted').length) $('.cartonbox-nav-dotted li').removeClass('active').eq(cbThis.data('cb-group-index')).addClass('active');
				
				settings.onLoadBefore();
				$('.cartonbox-content').hide().html('');
				cbFuncTypeClassDel();
				
				// Показываем прелоадер
				$('.cartonbox-preloader').show();
				
				// Если ссылка групповая, добавляем класс
				if (cbThis.data('cb-group') && cbThis.data('cb-group') != '' && settings.nav == 'dotted') $('.cartonbox-wrap').addClass('cartonbox-nav-on');
				
				// Link
				var cbHref = cbThis.attr('href');
				
				// Type
				var cbType = cbThis.data('cb-type');
				
				// Hash
				var cbHash = cbThis.data('cb-hash');
				var ie = 0 /*@cc_on + @_jscript_version @*/;
				if (!ie) {
					if (cbHash && cbHash != '') window.history.replaceState(null, null, '#' + cbHash);
					//else window.history.replaceState(null, null, '#');
				}
				
				// Design
				var cbDesign = cbThis.data('cb-design');
				if (cbDesign && cbDesign != '') $('.cartonbox-wrap').addClass(cbDesign);
				
				if (cbType == 'inline') { // Inline
					if ($(cbHref).length) {
						$(cbHref).clone(true).prependTo('.cartonbox-content');
						$('.cartonbox-wrap').addClass('cartonbox-inline');
						cbFuncPreload(cbThis);
					} else {
						cbFuncEndLoad(cbThis);
						settings.onError();
					}
				} else if (cbType == 'iframe') { // Iframe
					$('.cartonbox-content').html('<iframe src="' + cbHref + '" frameborder="0" seamless="seamless"></iframe>');
					$('.cartonbox-wrap').addClass('cartonbox-iframe');
					cbFuncPreload(cbThis);
				} else if (cbType == 'img') { // Image
					$('.cartonbox-content').html('<img src="' + cbHref + '">');
					$('.cartonbox-wrap').addClass('cartonbox-img');
					cbFuncPreload(cbThis);
				} else if(cbType == 'inline-iframe') { // допиливание для impuls
            $.ajax({
              url: cbHref,
              type: 'GET',
              dataType: 'html',
              success: function(data) {
                $('#popup-iframe').html(data)
                $('#popup-iframe').clone(true).prependTo('.cartonbox-content');
                $('.cartonbox-wrap').addClass('cartonbox-inline');
                cbFuncPreload(cbThis);
              }
            });
				}
			}
		}
		
		// Функция предварительной загрузки окна
		function cbFuncPreload(cbThis) {
			// Создаем массивы со списком загрузок
			var cbImgArr = new Array();
			var cbIframeArr = new Array();
			
			// Добавляем в массив загружаемые элементы
			$('.cartonbox-container, .cartonbox-container *').each(function() {
				if ($(this).css('background-image') != 'none') {
					var string = $(this).css('background-image');
					if (/url\(/i.test(string)) {
						string = string.replace(/^(url\()?\"?\'?/i, '');
						string = string.replace(/\"?\'?\)?$/i, '');
						cbImgArr.push(string);
					}
				}
				if ($(this).is('img')) cbImgArr.push($(this).attr('src'));
				if ($(this).is('iframe')) cbIframeArr.push($(this));
			});
			
			// Общее кол-во загружаемых элементов
			var cbArrCount = cbImgArr.length + cbIframeArr.length;
			
			// Прогружаем все заранее и показываем попап
			if (cbArrCount > 0) {
				var n = 0;
				if (cbImgArr.length > 0) {
					for (var i = 0; i < cbImgArr.length; i++) {
						var cbNewImage = new Image();
						$(cbNewImage).attr('src', cbImgArr[i]).on('error', function() {
							n++;
							if (cbArrCount == n) cbFuncEndLoad(cbThis);
							settings.onError();
						}).load(function() {
							n++;
							if (cbArrCount == n) cbFuncEndLoad(cbThis, cbNewImage.naturalWidth, cbNewImage.naturalHeight);
						});
					}
				}
				if (cbIframeArr.length > 0) {
					for (var i = 0; i < cbIframeArr.length; i++) {
						$(cbIframeArr[i]).load(function() {
							n++;
							if (cbArrCount == n) cbFuncEndLoad(cbThis);
						});
					}
				}
			} else cbFuncEndLoad(cbThis);
		}
		
		// Действия после полной загрузки содержимого
		function cbFuncEndLoad(cbThis, cbImgW, cbImgH) {
			settings.onLoadAfter();
			settings.onShowBefore();
			
			// Скрываем прелоадер
			$('.cartonbox-preloader').hide();
			
			// Делаем картинку видной целиком
			if ($('.cartonbox-wrap').hasClass('cartonbox-img')) {
				// Соотношение сторон
				var cbWrapPaddingTB = $('.cartonbox-wrap').css('padding-top').replace(/px/i, '') * 1 + $('.cartonbox-wrap').css('padding-bottom').replace(/px/i, '') * 1;
				var cbWrapPaddingLR = $('.cartonbox-wrap').css('padding-left').replace(/px/i, '') * 1 + $('.cartonbox-wrap').css('padding-right').replace(/px/i, '') * 1;
				var cbImgRatio = cbImgH / cbImgW;
				if (cbImgW + cbWrapPaddingLR >= $(window).width()) {
					cbImgW = $(window).width() - cbWrapPaddingLR;
					cbImgH = cbImgW * cbImgRatio;
					if (cbImgH > $(window).height() - cbWrapPaddingTB) {
						cbImgW = ($(window).height() - cbWrapPaddingTB) / cbImgRatio;
						cbImgH = cbImgW * cbImgRatio;
					}
				} else if (cbImgH + cbWrapPaddingTB >= $(window).height()) {
					cbImgH = $(window).height() - cbWrapPaddingTB;
					cbImgW = cbImgH / cbImgRatio;
					if (cbImgW > $(window).width() - cbWrapPaddingLR) {
						cbImgW = $(window).width() - cbWrapPaddingLR;
					}
				}
				$('.cartonbox-content img').attr({'width': Math.ceil(cbImgW), 'height': Math.ceil(cbImgH)});
				$('.cartonbox-wrap').css('width', cbImgW);
			}
			
			// Caption
			var cbCaption = cbThis.data('cb-caption');
			if (cbCaption && cbCaption != "") $('<div class="cartonbox-caption"><div class="cartonbox-caption-text">' + cbCaption + '</div></div>').appendTo('.cartonbox-content');
			
			$('.cartonbox-content').show();
			$('.cartonbox-container').width('').height('');
			if (!$('.cartonbox-wrap:visible').length) {
				$('.cartonbox-wrap').fadeIn(settings.speed, function() {
					settings.onShowAfter();
				});
			} else settings.onShowAfter();
			$('.cartonbox-container').width($('.cartonbox-container').width()).height($('.cartonbox-container').height());
			cbFuncCenter();
			$(window).scrollTop(0);
		}
		
		// Стрелки
		function cbFuncArrows(cbThis) {
			if (cbThis.data('cb-group')) {
				var cbGroupTotal = $('.' + settings.source + '[data-cb-group=' +  cbThis.data('cb-group') + ']').not('.cartonbox-left a, .cartonbox-right a, .cartonbox-nav a').length;
				if ((cbThis.data('cb-group-index') != 0 || settings.cycle) && cbGroupTotal > 1) {
					var cbPrev = $('.' + settings.source + '[data-cb-group=' + cbThis.data('cb-group') + '][data-cb-group-index=' + (cbThis.data('cb-group-index') * 1 - 1) + ']');
					var cbPrevIndex = cbThis.data('cb-group-index') * 1 - 1;
					if (cbThis.data('cb-group-index') == 0) {
						cbPrev = $('.' + settings.source + '[data-cb-group=' + cbThis.data('cb-group') + '][data-cb-group-index=' + (cbGroupTotal - 1) + ']');
						cbPrevIndex = cbGroupTotal - 1;
					}
					var cbPrevHref = cbPrev.attr('href');
					var cbPrevType = cbPrev.data('cb-type');
					var cbPrevCaption = cbPrev.data('cb-caption');
					var cbPrevHash = cbPrev.data('cb-hash');
					var cbPrevDesign = cbPrev.data('cb-design');
					$('.cartonbox-left').html('<a href="' + cbPrevHref + '" class="' + settings.source + '" data-cb-type="' + cbPrevType + '" data-cb-group="' + cbThis.data('cb-group') + '" data-cb-group-index="' + cbPrevIndex + '"' + (cbPrevCaption && cbPrevCaption !="" ? ' data-cb-caption="' + cbPrevCaption + '"' : '') + '' + (cbPrevHash && cbPrevHash !="" ? ' data-cb-hash="' + cbPrevHash + '"' : '') + '' + (cbPrevDesign && cbPrevDesign !="" ? ' data-cb-design="' + cbPrevDesign + '"' : '') + '></a>').show();
				} else $('.cartonbox-left').html('').hide();
				if ((cbThis.data('cb-group-index') != (cbGroupTotal - 1) || settings.cycle) && cbGroupTotal > 1) {
					var cbNext = $('.' + settings.source + '[data-cb-group=' + cbThis.data('cb-group') + '][data-cb-group-index=' + (cbThis.data('cb-group-index') * 1 + 1) + ']');
					var cbNextIndex = cbThis.data('cb-group-index') * 1 + 1;
					if (cbThis.data('cb-group-index') == cbGroupTotal - 1) {
						cbNext = $('.' + settings.source + '[data-cb-group=' + cbThis.data('cb-group') + '][data-cb-group-index=0]');
						cbNextIndex = 0;
					}
					var cbNextHref = cbNext.attr('href');
					var cbNextType = cbNext.data('cb-type');
					var cbNextCaption = cbNext.data('cb-caption');
					var cbNextHash = cbNext.data('cb-hash');
					var cbNextDesign = cbNext.data('cb-design');
					$('.cartonbox-right').html('<a href="' + cbNextHref + '" class="' + settings.source + '" data-cb-type="' + cbNextType + '" data-cb-group="' + cbThis.data('cb-group') + '" data-cb-group-index="' + cbNextIndex + '"' + (cbNextCaption && cbNextCaption !="" ? ' data-cb-caption="' + cbNextCaption + '"' : '') + '' + (cbNextHash && cbNextHash !="" ? ' data-cb-hash="' + cbNextHash + '"' : '') + '' + (cbNextDesign && cbNextDesign !="" ? ' data-cb-design="' + cbNextDesign + '"' : '') + '></a>').show();
				} else $('.cartonbox-right').html('').hide();
			}
		}
		
		// Функция удаления классов соответствующих типу загруженного контента
		function cbFuncTypeClassDel() {
			$('.cartonbox-wrap').removeAttr('class').addClass('cartonbox-wrap');
		}
		
		// Функция центрирования попапа
		function cbFuncCenter() {
			if ($('.cartonbox-body').data('cb-source') == settings.source) {
				var cbBackHeight = $('.cartonbox-back').height();
				var cbWrapHeight = $('.cartonbox-wrap').innerHeight();
				if (cbBackHeight > cbWrapHeight) {
					var cbWrapMarginTop = (cbBackHeight - cbWrapHeight) / 2;
					$('.cartonbox-wrap').css('margin-top', cbWrapMarginTop);
				} else $('.cartonbox-wrap').css('margin-top', 0);
			}
		}
		
		// Функция закрытия модального окна
		function cbFuncClosed() {
			settings.onClosedBefore();
				
			// Скрываем бэк и прелоадер
			$('.cartonbox-back').fadeOut(settings.speed);
			$('.cartonbox-preloader').hide();
			$('.cartonbox-body').removeClass('cartonbox-on');
			
			// Удаляем hash
			var ie = 0 /*@cc_on + @_jscript_version @*/;
			if (!ie) {
				if (window.location.hash != '') window.history.replaceState(null, null, '#');
			}
			
			// Скрываем модальное окно
			$('.cartonbox-wrap').fadeOut(settings.speed, function() {
				$('.cartonbox-left, .cartonbox-right, .cartonbox-nav').hide();
				
				// Удаляем все из контентной части
				cbFuncTypeClassDel();
				$('.cartonbox-content, .cartonbox-left, .cartonbox-right, .cartonbox-nav').html('');
				
				// Убираем лишние стили
				$('.cartonbox-wrap, .cartonbox-container').removeAttr('style');
				
				// Делаем кишки подвижными
				var cbScrollTop = $('.cartonbox-body').data('cb-top') * 1;
				$('.cartonbox-body').removeData('cb-top').removeData('cb-source').removeAttr('style');
				$(window).scrollTop(cbScrollTop);
				
				settings.onClosedAfter();
			});
			
		}
		
		// Закрытие модального окна
		$('.cartonbox-back, .cartonbox-preloader, .cartonbox-wrap, .cartonbox-close, .cartonbox-nav').on('click', function(e) {
			if (e.target == this && $('.cartonbox-body').data('cb-source') == settings.source) cbFuncClosed();
		});
		
		// Закрытие модального окна по клавише Esc
		$(window).on('keydown', function(e) {
			if ($('.cartonbox-on').length) {
				if (e.which == 27) cbFuncClosed();
			}
		});
		
	};

})(jQuery);