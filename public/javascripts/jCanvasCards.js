/*
jCanvasCards
Guy Moreau, 2013
LGPL v3

Note: if scale drops below .5, small scale images are used.
*/
(function ($) {
	'use strict';
	var mPrefs,
		mSuits = { //configuration data
			clubs: {source: "/assets/javascripts/svgs/pips/club.svg"},
			hearts: {source: "/assets/javascripts/svgs/pips/heart.svg"},
			spades: {source: "/assets/javascripts/svgs/pips/spade.svg"},
			diamonds: {source: "/assets/javascripts/svgs/pips/diamond.svg"}
		},
		mBacks = { //more configuration data
			red: {
				sWidth: 224,
				sHeight: 312,
				sx: 260, sy: 370,
				source: "/assets/javascripts/svgs/backs/Red_Back.svg"},
			blue: {
				large_sWidth: 224,
				large_sHeight: 312,
				large_sx: 260, large_sy: 370,
				large_source: "/assets/javascripts/svgs/backs/Blue_Back.svg",
				small_sWidth: 115,
				small_sHeight: 162,
				small_sx: 0, small_sy: 0,
				small_source: "/assets/javascripts/svgs/backs/blueback_stars.svg"}
		};

	//make non s suit names work as well by copying them
	mSuits.club = mSuits.clubs;
	mSuits.heart = mSuits.hearts;
	mSuits.spade = mSuits.spades;
	mSuits.diamond = mSuits.diamonds;

	// jCanvas function for setting property defaults (it's also an object)
	function jCanvasCards(args) {
		if (args) {
			// Merge arguments with preferences
			mPrefs = $.extend({}, mPrefs, args);
		} else {
			// Reset preferences to defaults if nothing is passed
			jCanvasCards.mPrefs = mPrefs = jCanvasCards.prototype = $.extend({}, $.fn.jCanvasCards.defaults);
		}
		return this;
	}
	// Allow jCanvasCards function to be "chained" to other methods
	$.fn.jCanvasCards = jCanvasCards;

	// Events object for maintaining jCanvasCards event initiation functions
	jCanvasCards.events = {};

	//adjust x and y for scale
	function adjustForScale(args) {
		//take new height / width, get difference with scale, move by half
		return {
			x: (args.sWidth ? args.x - (args.sWidth - (args.sWidth * args.scaleX)) / 2 : args.x - (args.width - (args.width * args.scaleX)) / 2),
			y: (args.sHeight ? args.y - (args.sHeight - (args.sHeight * args.scaleY)) / 2 : args.y - (args.height - (args.height & args.scaleY)) / 2)
		};
	};

	// jCanvasCards default property values
	$.fn.jCanvasCards.defaults = {
		scaleX: 1,
		scaleY: 1,
		rotation: 0,
		layer: true,
		cropFromCenter: false,
		fromCenter: false,
		visible: false
	};

	$.fn.drawSuit = function(aOptions) {
		var opts = $.extend({}, $.fn.jCanvasCards.defaults, mPrefs, aOptions, {
			sWidth: 150,
			sHeight: 160,
			sx: 0, sy: 0,
			method: "drawImage"
		}, mSuits[aOptions.suit]);
		opts = $.extend({}, opts, adjustForScale(opts));

		return this.addLayer(opts);
	};

	$.fn.drawBack = function(aOptions) {
		var opts = $.extend({}, $.fn.jCanvasCards.defaults, mPrefs, aOptions, mBacks[aOptions.back]);
		
		if (opts.scaleX < 0.5 || opts.scaleY < 0.5) {
			//switch to small scale
			opts =$.extend({}, opts, {
				sWidth: opts.small_sWidth,
				sHeight: opts.small_sHeight,
				sx: opts.small_sx, sy: opts.small_sy,
				source: opts.small_source,
				scaleX: opts.scaleX * 2, scaleY: opts.scaleY * 2,
				method: "drawImage"
			});
		} else {
			opts =$.extend({}, opts, {
				sWidth: opts.large_sWidth,
				sHeight: opts.large_sHeight,
				sx: opts.large_sx, sy: opts.large_sy,
				source: opts.large_source,
				method: "drawImage"
			});
		}

		opts = $.extend({}, opts, adjustForScale(opts));
		return this.addLayer(opts);
	};

	//draw a card on screen
	$.fn.drawCard = function(aOptions) {
		var opts = $.extend({}, $.fn.jCanvasCards.defaults, mPrefs, aOptions, {
			source: "http://localhost:9000/assets/javascripts/svgs/cards_small/" + aOptions.card + ".svg",
			sWidth: 226,
			sHeight: 314,
			sx: 36, sy: 42,
			method: "drawImage"
		});

		if (aOptions.card === "blank" || aOptions.card === "empty") {
			opts.source = "http://localhost:9000/assets/javascripts/svgs/pips/blank.svg";
		}

		opts = $.extend({}, opts, adjustForScale(opts));
		return this.addLayer(opts);
	};

	$.fn.updateCard = function(aLayer, aOptions) {
		var opts = $.extend({}, $.fn.jCanvasCards.defaults, mPrefs, aOptions, {
			source: "/assets/javascripts/svgs/cards_small/" + aOptions.card + ".svg",
			sWidth: 226,
			sHeight: 314,
			sx: 36, sy: 42
		});

		if (aOptions.card === "blank" || aOptions.card === "empty") {
			opts.source = "/assets/javascripts/svgs/pips/blank.svg";
		}

		//opts = $.extend({}, opts, adjustForScale(opts));
		return this.setLayer(aLayer, opts).drawLayers;
	};

	$.fn.drawCardOutline = function(aOptions) {
		//farm off to drawCard, but as a blank
		aOptions.card = "blank";
		return this.drawCard(aOptions);
	};
})( jQuery );