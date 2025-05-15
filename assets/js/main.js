(function($) {

	var	$window = $(window),
		$body = $('body'),
		$wrapper = $('#wrapper'),
		$header = $('#header'),
		$banner = $('#banner');

	// Breakpoints.
		breakpoints({
			xlarge:    ['1281px',   '1680px'   ],
			large:     ['981px',    '1280px'   ],
			medium:    ['737px',    '980px'    ],
			small:     ['481px',    '736px'    ],
			xsmall:    ['361px',    '480px'    ],
			xxsmall:   [null,       '360px'    ]
		});

	/**
	 * Applies parallax scrolling to an element's background image.
	 * @return {jQuery} jQuery object.
	 */
	$.fn._parallax = (browser.name == 'ie' || browser.name == 'edge' || browser.mobile) ? function() { return $(this) } : function(intensity) {

		var	$window = $(window),
			$this = $(this);

		if (this.length == 0 || intensity === 0)
			return $this;

		if (this.length > 1) {

			for (var i=0; i < this.length; i++)
				$(this[i])._parallax(intensity);

			return $this;

		}

		if (!intensity)
			intensity = 0.25;

		$this.each(function() {

			var $t = $(this),
				on, off;

			on = function() {

				$t.css('background-position', 'center 100%, center 100%, center 0px');

				$window
					.on('scroll._parallax', function() {

						var pos = parseInt($window.scrollTop()) - parseInt($t.position().top);

						$t.css('background-position', 'center ' + (pos * (-1 * intensity)) + 'px');

					});

			};

			off = function() {

				$t
					.css('background-position', '');

				$window
					.off('scroll._parallax');

			};

			breakpoints.on('<=medium', off);
			breakpoints.on('>medium', on);

		});

		$window
			.off('load._parallax resize._parallax')
			.on('load._parallax resize._parallax', function() {
				$window.trigger('scroll');
			});

		return $(this);

	};

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Clear transitioning state on unload/hide.
		$window.on('unload pagehide', function() {
			window.setTimeout(function() {
				$('.is-transitioning').removeClass('is-transitioning');
			}, 250);
		});

	// Fix: Enable IE-only tweaks.
		if (browser.name == 'ie' || browser.name == 'edge')
			$body.addClass('is-ie');

	// Scrolly.
		$('.scrolly').scrolly({
			offset: function() {
				return $header.height() - 2;
			}
		});

	// Tiles.
		var $tiles = $('.tiles > article');

		$tiles.each(function() {

			var $this = $(this),
				$image = $this.find('.image'), $img = $image.find('img'),
				$link = $this.find('.link'),
				x;

			// Image.

				// Set image.
					$this.css('background-image', 'url(' + $img.attr('src') + ')');

				// Set position.
					if (x = $img.data('position'))
						$image.css('background-position', x);

				// Hide original.
					$image.hide();

			// Link.
				if ($link.length > 0) {

					$x = $link.clone()
						.text('')
						.addClass('primary')
						.appendTo($this);

					$link = $link.add($x);

					$link.on('click', function(event) {

						var href = $link.attr('href');

						// Prevent default.
							event.stopPropagation();
							event.preventDefault();

						// Target blank?
							if ($link.attr('target') == '_blank') {

								// Open in new tab.
									window.open(href);

							}

						// Otherwise ...
							else {

								// Start transitioning.
									$this.addClass('is-transitioning');
									$wrapper.addClass('is-transitioning');

								// Redirect.
									window.setTimeout(function() {
										location.href = href;
									}, 500);

							}

					});

				}

		});

	// Header.
		if ($banner.length > 0
		&&	$header.hasClass('alt')) {

			$window.on('resize', function() {
				$window.trigger('scroll');
			});

			$window.on('load', function() {

				$banner.scrollex({
					bottom:		$header.height() + 10,
					terminate:	function() { $header.removeClass('alt'); },
					enter:		function() { $header.addClass('alt'); },
					leave:		function() { $header.removeClass('alt'); $header.addClass('reveal'); }
				});

				window.setTimeout(function() {
					$window.triggerHandler('scroll');
				}, 100);

			});

		}

	// Banner.
		$banner.each(function() {

			var $this = $(this),
				$image = $this.find('.image'), $img = $image.find('img');

			// Parallax.
				$this._parallax(0.275);

			// Image.
				if ($image.length > 0) {

					// Set image.
						$this.css('background-image', 'url(' + $img.attr('src') + ')');

					// Hide original.
						$image.hide();

				}

		});

	// Menu.
		var $menu = $('#menu'),
			$menuInner;

		$menu.wrapInner('<div class="inner"></div>');
		$menuInner = $menu.children('.inner');
		$menu._locked = false;

		$menu._lock = function() {

			if ($menu._locked)
				return false;

			$menu._locked = true;

			window.setTimeout(function() {
				$menu._locked = false;
			}, 350);

			return true;

		};

		$menu._show = function() {

			if ($menu._lock())
				$body.addClass('is-menu-visible');

		};

		$menu._hide = function() {

			if ($menu._lock())
				$body.removeClass('is-menu-visible');

		};

		$menu._toggle = function() {

			if ($menu._lock())
				$body.toggleClass('is-menu-visible');

		};

		$menuInner
			.on('click', function(event) {
				event.stopPropagation();
			})
			.on('click', 'a', function(event) {

				var href = $(this).attr('href');

				event.preventDefault();
				event.stopPropagation();

				// Hide.
					$menu._hide();

				// Redirect.
					window.setTimeout(function() {
						window.location.href = href;
					}, 250);

			});

		$menu
			.appendTo($body)
			.on('click', function(event) {

				event.stopPropagation();
				event.preventDefault();

				$body.removeClass('is-menu-visible');

			})
			.append('<a class="close" href="#menu">Close</a>');

		$body
			.on('click', 'a[href="#menu"]', function(event) {

				event.stopPropagation();
				event.preventDefault();

				// Toggle.
					$menu._toggle();

			})
			.on('click', function(event) {

				// Hide.
					$menu._hide();

			})
			.on('keydown', function(event) {

				// Hide on escape.
					if (event.keyCode == 27)
						$menu._hide();

			});

// ───────────────────────────────────────────────────────────────────────────
// Utility functions for Sticky Banner
// ───────────────────────────────────────────────────────────────────────────
if (typeof Util === 'undefined') {
  function Util() {}
}

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
  if (bool) Util.addClass(el, className);
  else    Util.removeClass(el, className);
};

// ───────────────────────────────────────────────────────────────────────────
// Sticky‐banner IIFE
// ───────────────────────────────────────────────────────────────────────────
;(function() {
  var StickyBanner = function(element) {
    this.element       = element;
    this.offsetIn      = 0;
    this.offsetOut     = 0;
    this.targetIn      = element.getAttribute('data-target-in')
                          ? document.querySelector(element.getAttribute('data-target-in'))
                          : false;
    this.targetOut     = element.getAttribute('data-target-out')
                          ? document.querySelector(element.getAttribute('data-target-out'))
                          : false;
    this.reset         = 0;
    this.dataElement   = element.getAttribute('data-scrollable-element')
                          || element.getAttribute('data-element');
    this.scrollElement = this.dataElement
                          ? document.querySelector(this.dataElement)
                          : window;
    if (!this.scrollElement) this.scrollElement = window;
    this.scrollingId = false;
    getBannerOffsets(this);
    initBanner(this);
  };

  function getBannerOffsets(el) {
    el.offsetIn = 0;
    var winTop = getScrollTop(el);
    if (el.targetIn) {
      var r = el.targetIn.getBoundingClientRect();
      el.offsetIn = r.top + winTop + r.height;
    }
    var di = el.element.getAttribute('data-offset-in');
    if (di) el.offsetIn += parseInt(di, 10);

    el.offsetOut = 0;
    if (el.targetOut) {
      var r2 = el.targetOut.getBoundingClientRect();
      el.offsetOut = r2.top + winTop - window.innerHeight;
    }
    var dout = el.element.getAttribute('data-offset-out');
    if (dout) el.offsetOut += parseInt(dout, 10);
  }

  function initBanner(el) {
    resetBannerVisibility(el);
    el.element.addEventListener('resize-banner', function() {
      getBannerOffsets(el);
      resetBannerVisibility(el);
    });
    el.element.addEventListener('scroll-banner', function() {
      if (el.reset < 10) {
        getBannerOffsets(el);
        el.reset++;
      }
      resetBannerVisibility(el);
    });
    if (el.dataElement && el.scrollElement) {
      el.scrollElement.addEventListener('scroll', function() {
        if (el.scrollingId) return;
        el.scrollingId = true;
        window.requestAnimationFrame(function() {
          el.element.dispatchEvent(new CustomEvent('scroll-banner'));
          el.scrollingId = false;
        });
      });
    }
  }

  function resetBannerVisibility(el) {
    var st   = getScrollTop(el),
        show = (el.offsetIn <= st) && (el.offsetOut === 0 || st < el.offsetOut);
    Util.toggleClass(el.element, 'sticky-banner--visible', show);
  }

  function getScrollTop(el) {
    var st = el.scrollElement.scrollTop || document.documentElement.scrollTop;
    if (!el.dataElement) st = window.scrollY || document.documentElement.scrollTop;
    return st;
  }

  var banners = document.getElementsByClassName('js-sticky-banner');
  if (banners.length) {
    for (var i = 0; i < banners.length; i++) {
      new StickyBanner(banners[i]);
    }

    var resizeEvt = new CustomEvent('resize-banner'),
        scrollEvt = new CustomEvent('scroll-banner'),
        resizeTimer, scrolling;

    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        dispatchAll(banners, resizeEvt);
      }, 300);
    });

    window.addEventListener('scroll', function() {
      if (!scrolling) {
        window.requestAnimationFrame
          ? window.requestAnimationFrame(function() {
              dispatchAll(banners, scrollEvt);
              scrolling = false;
            })
          : setTimeout(function() {
              dispatchAll(banners, scrollEvt);
              scrolling = false;
            }, 200);
      }
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        dispatchAll(banners, resizeEvt);
      }, 300);
    });

    function dispatchAll(coll, evt) {
      for (var j = 0; j < coll.length; j++) {
        coll[j].dispatchEvent(evt);
      }
    }
  }
}());

})(jQuery);