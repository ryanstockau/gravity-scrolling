/*

Gravity Scrolling jQuery Plugin by Ryan Stock

www.github.com/ryanstockau/gravity-scrolling

www.ryanstock.com.au


LICENSE

The MIT License (MIT)

Copyright (c) 2015 Ryan Stock

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

(function($) {

    $.fn.gravityScroll = function(method) {
		
		var settings;
		
		// The original container that gravityScroll() is attached to.
		var $original_container;
		
		// We sometimes have to change the container to something that works better than what the user provided. i.e. $('body')
		var $container;
		
		// The container that works better for scroll events. i.e. $original_container or ('html,body')
		var $scroll_container;
		
		// The container that works better for animating scrolling. i.e. $original_container or $(document)
		var $animation_container;
		
		// All the children elements
		var $children = $();
		
        var methods = {
            init : function(options) {
                settings = $.extend({}, this.gravityScroll.defaults, options);
				if ( ! settings.children.length ) {
					return;	
				}
				$original_container = this;
				
				// If the container is not able to handle scroll events, use the the best alternatives instead.
				if ( $original_container.is($('html,body')) || $original_container.is($(settings.window)) ) {
					$container = $('body');
					$scroll_container = $(document);
					$animation_container = $('body,html');
				} else {
					$container = $original_container;
					$scroll_container = $original_container;
					$animation_container = $original_container;
				}
				
				helpers.addChildren( settings.children );
				helpers.attachScrollHandler();
				
				helpers.log( 'Children:', $children );
            }
        };
	

        var helpers = {
			
			// Register children with the plugin while setting their data attributes
			addChild: function( child ) {
				var info = $.extend({}, $original_container.gravityScroll.child_defaults, child);					
				var $child = $(info.selector);
				helpers.log( 'Adding child', $child );
				$child.data('gravityscroll-pause', info.pause);
				$child.data('gravityscroll-range', info.range);
				$child.data('gravityscroll-easing', info.easing);
				$children = $children.add( $child );
			},
			
			// Go through children and register them
			addChildren: function( children ) {
				helpers.log( 'Adding children', children );
				for( var i = 0; i < children.length; i++ ) {
					helpers.addChild( children[i] );
				}
			},
			
			// Attach the gravity scroll handler to an element. (The container that scrolls)
			attachScrollHandler: function() {
				if ( $container.data( 'gravityscroll-hashandler' ) === '1' ) {
					return;	
				}
				$scroll_container.scroll(function(e) {
					// Ensure scroll events don't take up too much CPU by calling only before animation frame change.
					window.requestAnimationFrame( helpers.scrollHandler );
				});
				$container.data( 'gravityscroll-hashandler', '1' );
				$scroll_container.scroll();
			},
			
			// Return all children who we might potentially scroll to
			getChildrenInDangerZone: function() {
				var $matches = $();
				$children.each(function() {
					$child = $(this);
					if ( helpers.isInDangerZone( $child ) ) {
						$matches = $matches.add( $child );
						helpers.log( 'Matched:', $child, $matches );
					}
				});	
				return $matches;		
			},
			
			// Get the current scroll position of an object (or the window if object not provided)
			getScrollPosition: function( object ) {
				if ( ! object ) {
					object = window;
				}
				return [
					$(object).scrollLeft(),
					$(object).scrollTop()
			 	];
			},
			
			// Get relative position between two elements.
			getRelativePosition: function( of, to ) {
				helpers.log( 'getRelativePosition', of, to );
				helpers.log( settings.document, settings.window );
				var of_offset, to_offset;
				if ( of.is(settings.document) ) {
					of_offset = { 'left': settings.window.scrollLeft(), 'top': settings.window.scrollTop() };
				} else {
					of_offset = of.offset();	
				}
				if ( to.is(settings.document) ) {
					to_offset = { 'left': settings.window.scrollLeft(), 'top': settings.window.scrollTop() };
				} else {
					to_offset = to.offset();
				}
				return [
					of_offset.left - to_offset.left,
					of_offset.top - to_offset.top
				];
			},
			
			// Is the element in a position that will be effected by gravity?
			isInDangerZone: function( element ) {
				var $element = element;
				var position = -helpers.positionFromContainer( $element );
				helpers.log( 'Position from danger zone:', position, $element, $element.data('gravityscroll-range') );
				return (
					( $element.data('gravityscroll-range')[0] < position ) && ( position < $element.data('gravityscroll-range')[1] )
				);				
			},
			
			// Pixel distance that $element is away from $container
			positionFromContainer: function( element ) {
				var $element = element;
				return helpers.getRelativePosition( $element, $scroll_container )[1];
			},
			
			// Called on the container when the user scrolls.
            scrollHandler: function() {
				helpers.log( 'Handling scroll' );
				$container.data('gravityscroll-moving','1');
				clearTimeout( $container.data('gravityscroll-scrollingtimeout') );
				$container.data('gravityscroll-scrollingtimeout', 
					setTimeout( function() {
						helpers.log( 'Slowed' );
						$container.data('gravityscroll-scrolling','0');
					}, 150 )
				);
				helpers.log( 'Scrolling' );
				if ( $container.data('gravityscroll-hasdone') === '1' ) {
					return;
				}
				// When the continer has finished scrolling...
				helpers.whenFinishedScrollMovement( $scroll_container ).done( function() {
					helpers.log( 'Stopped' );
					$container.data('gravityscroll-scrolling','0');
					$container.data('gravityscroll-moving','0');
					var $closest_match = null;
					var closest_distance_from_danger = null;
					var $matches = helpers.getChildrenInDangerZone();
					helpers.log( 'Children found in danger zone: ', $matches.length );
					$matches.each(function() {
						$element = $(this);
						var distance_from_danger = Math.abs(helpers.positionFromContainer( $element ));
						if ( closest_distance_from_danger !== null ) {
							if ( distance_from_danger < closest_distance_from_danger ) {
								$closest_match = $element;
								closest_distance_from_danger = distance_from_danger;
							}
						} else {
							$closest_match = $element;	
							closest_distance_from_danger = distance_from_danger;
						}
					});
					if ( $closest_match !== null ) {
						helpers.scrollContainerToElement( $closest_match );
					}
					$container.data('gravityscroll-hasdone','0');
				});
				$container.data('gravityscroll-hasdone','1');
			},
			
			// a Promise that is .done() when the scrolling movement of the element has stopped.
			whenFinishedScrollMovement: function( element ) {
				$element = element;
				// If we already have a Deferred, return that.
				if ( typeof element.data( 'gravityscroll-movementdeferred' ) !== 'undefined' ) {
					return element.data( 'gravityscroll-movementdeferred' );
				}
				$df = $.Deferred();
				$element.data( 'gravityscroll-movementdeferred', $df );
				var previous_distance = $element.scrollTop();
				
				// Check if the container has finished moving every 100ms. 
				$element.data( 'gravityscroll-movementtimeout', setInterval( function() {
					var current_distance = $element.scrollTop();					
					var distance_diff = current_distance - previous_distance;
					// If it hasn't moved since the last check, resolve Deferred.
					if ( distance_diff == 0 ) {						
						clearTimeout( element.data( 'gravityscroll-movementtimeout' ) );
						$element.removeData( 'gravityscroll-movementdeferred' );
						$element.removeData( 'gravityscroll-movementtimeout' );
						$df.resolve();
					}
					previous_distance = current_distance;
				}, 200 ));
				return $df.promise();
			},
			
			// Scroll container so element is at the top.
			scrollContainerToElement: function( element ) {
				var $element = element;
				var pause = $element.data('gravityscroll-pause');
				if ( $container.data('gravityscroll-animating') === '1' ) {
					helpers.log( 'Already scrolling - ignore.' );
					return;
				}
				$container.data('gravityscroll-currentpause', pause);
				var relative_position = helpers.getRelativePosition( $element, $scroll_container );
				var position = $animation_container.scrollTop() + parseInt(relative_position[1]);
				helpers.log( 'Scrolling container to ', position );
				$container.data('gravityscroll-animating', '1');
				helpers.log('$animation_container.stop()');
				$animation_container.stop('gravityscroll-animation-queue');
				helpers.log('$animation_container.animate()');
				$animation_container.animate({scrollTop:position},{
					speed: settings.speed,
					easing: $element.data('gravityscroll-easing'),
					queue: 'gravityscroll-animation-queue'
				}).promise().done(function() {
					helpers.log( 'Completed animation' );
					$element.data('gravityscroll-indanger', '0' );
					$container.data('gravityscroll-animating', '0');
					$container.data('gravityscroll-currentpause', '0');
				});
				$animation_container.dequeue( 'gravityscroll-animation-queue' );
			},
			
			log: function() {
				if ( settings.developer ) {
					if(typeof(console) !== 'undefined'){
						console.log.apply(console, arguments);
					}			
				}
			}
        }		
		// Depending on args sent to gravityScroll()...
        if (methods[method]) {
			// ...if method exists for it, return that.
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
			// ...if not, call the init.
            return methods.init.apply(this, arguments);
        } else {
			// ...or throw an error.
            $.error( 'Method "' +  method + '" does not exist in gravityScroll plugin!');
        }

    }
	
    $.fn.gravityScroll.defaults = {
		debug: false,
		window: $(window),
		document: $(document)
    }

    $.fn.gravityScroll.child_defaults = {
        range: [-20, 20],
		updateDistance: 2,
		pause: 250,
		speed: 400,
		easing: 'swing'
    }

    $.fn.gravityScroll.settings = {}

})(jQuery);
