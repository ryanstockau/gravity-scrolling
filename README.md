<h1>Gravity Scrolling</h1>
jQuery plugin that allows a container element to scroll towards and lock onto certain child elements when you scroll.

<h2>Usage</h2>
1. Include the jquery.gravityscrolling.js file in your project, after jQuery.
2. Ensure the outer container element (you'll usually use $('html')) is scrollable (CSS 'overflow' set to 'scroll').
3. Run this:
<pre>
  $('#outer-container').gravityScroll({
    'children': [{'selector':'#outer-container .my-child-elements'}]
  });
</pre>

<h2>Examples</h2>

<h3>Basic Example</h3>
<p>This example allows you to scroll as you usually would, but if a H2 elements ends up within 50px of the top of the screen (above or below), we scroll to it.</p>
<pre>
  $('html').gravityScroll({
		'children': [
			{
				'selector': 'h2',
				'range': [-50, 50],
			}
		]
	});
</pre>
	
	
<h3>Advanced Example</h3>
<p>Registering multiple children sets allows you to define different arguments for each set. The nav object must be scrollable.</p>

<pre>
  $('#secondary-navigation nav').gravityScroll({
		'children': [
			{
				'selector': '#secondary-navigation nav li:first-child',
				'range': [-100, 1],
				'easing': 'linear'
			}, {
				'selector': '#secondary-navigation nav li:nth-child(4)',
				'range': [-45, 300]
			}
		]
	});
</pre>
	
<h3>Example Using Bez Easing</h3>
<p>Bez allows you to use cubic-bezier animations in jQuery. Be sure to download Bez from <a href="https://github.com/rdallasgray/bez" target="_blank">here</a> and include it in your project first.</p>

<pre>
  $('html').gravityScroll({
		'children': [
			{
				'selector': 'h2',
				'easing': $.bez([.55,0,.1,1])
			}
		]
	});
</pre>
  
  
<h3>Options</h3>

- #container = The outer container that scrolls - usually $('html').
  - children = An array of objects representing each set of child elements that will affect the container's scrolling. Contains the following options:
    - easing = The easing of the container's scroll animation to the child. Can be anything that .animate() can accept.
    - range = A two dimensional array [-20, 20] representing the pixel distance ([above, below] the child) to check for collisions with the container.
    - selector = A string selector for this set of children. Be specific - elements must be children of #container.
  - developer = Whether or not to show log information in the Console. Use this if you are having problems.



<h2>To Do</h2>
<ul>
  <li>Allow children to be registered as $() objects, not just as string selectors</li>
  <li>Reduce any jitters</li>
  <li>Allow customised timing</li>
  <li>Optimise code</li>
  <li>Data keys as variables/constants instead of strings</li>
</ul>
