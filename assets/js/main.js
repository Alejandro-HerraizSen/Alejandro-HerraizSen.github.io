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
// Sticky-Banner IIFE
// ───────────────────────────────────────────────────────────────────────────
;(function() {
  var StickyBanner = function(el) {
    this.el          = el;
    this.offsetIn    = 0;
    this.offsetOut   = 0;
    this.targetIn    = el.getAttribute('data-target-in')
                          ? document.querySelector(el.getAttribute('data-target-in'))
                          : false;
    this.targetOut   = el.getAttribute('data-target-out')
                          ? document.querySelector(el.getAttribute('data-target-out'))
                          : false;
    this.resetCount  = 0;
    this.dataElement = el.getAttribute('data-scrollable-element')
                          || el.getAttribute('data-element');
    this.scrollEl    = this.dataElement
                          ? document.querySelector(this.dataElement)
                          : window;
    if (!this.scrollEl) this.scrollEl = window;
    this.busy = false;
    this._calcOffsets();
    this._init();
  };

  StickyBanner.prototype._calcOffsets = function() {
    var winTop = this._getScrollTop();
    this.offsetIn  = this.targetIn
      ? this.targetIn.getBoundingClientRect().top + winTop + this.targetIn.getBoundingClientRect().height
      : 0;
    var oI = this.el.getAttribute('data-offset-in');
    if (oI) this.offsetIn += parseInt(oI,10);

    this.offsetOut = this.targetOut
      ? this.targetOut.getBoundingClientRect().top + winTop - window.innerHeight
      : 0;
    var oO = this.el.getAttribute('data-offset-out');
    if (oO) this.offsetOut += parseInt(oO,10);
  };

  StickyBanner.prototype._init = function() {
    this._update();
    this.el.addEventListener('resize-banner', () => {
      this._calcOffsets();
      this._update();
    });
    this.el.addEventListener('scroll-banner', () => {
      if (this.resetCount < 10) {
        this._calcOffsets();
        this.resetCount++;
      }
      this._update();
    });
    this.scrollEl.addEventListener('scroll', () => {
      if (this.busy) return;
      this.busy = true;
      window.requestAnimationFrame(() => {
        this.el.dispatchEvent(new CustomEvent('scroll-banner'));
        this.busy = false;
      });
    });
  };

  StickyBanner.prototype._update = function() {
    var st = this._getScrollTop(),
        show = st >= this.offsetIn && (this.offsetOut === 0 || st < this.offsetOut);
    Util.toggleClass(this.el, 'sticky-banner--visible', show);
  };

  StickyBanner.prototype._getScrollTop = function() {
    if (this.dataElement)
      return this.scrollEl.scrollTop || document.documentElement.scrollTop;
    return window.scrollY || document.documentElement.scrollTop;
  };

  // initialize
  var elems = document.getElementsByClassName('js-sticky-banner');
  if (elems.length) {
    Array.prototype.forEach.call(elems, el => new StickyBanner(el));
    var resizeEvt = new CustomEvent('resize-banner'),
        scrollEvt = new CustomEvent('scroll-banner'),
        rT;
    window.addEventListener('resize', () => {
      clearTimeout(rT);
      rT = setTimeout(() => {
        Array.prototype.forEach.call(elems, el => el.dispatchEvent(resizeEvt));
      }, 300);
    });
    window.addEventListener('scroll', () => {
      Array.prototype.forEach.call(elems, el => el.dispatchEvent(scrollEvt));
    });
  }
}());

// ───────────────────────────────────────────────────────────────────────────
// Fade Section IIFE
// ───────────────────────────────────────────────────────────────────────────
;(function() {
  var secs = document.querySelectorAll('.fade-section');
  window.addEventListener('scroll', function() {
    var y = window.scrollY;
    secs.forEach(function(sec) {
      var midpoint = sec.offsetTop + sec.offsetHeight / 2;
      if (y > midpoint) sec.classList.add('faded');
      else               sec.classList.remove('faded');
    });
  });
})();

})(jQuery);