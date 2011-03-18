MooContentAssist
================

MooContentAssist is a javascript library that add a content assist feature to textareas in your webpage.

MooContentAssist is based on MooTools 1.3.1 and works with FireFox, Chrome, Safari, IE7/8.

Features
--------
 * Configurable results window style
 * Configurable vocabulary object/namespace
 * Full working with FireFox, Chrome/Chromium, Safari, IE7/8

How to use
----------

1-You need a textarea with the html id, example:

	<textarea id="myeditor">
		Lorem Ipsum
	</textarea>

2-Then include the MooContentAssist.js and CSS (and MooTools if you already haven't)

	<link type="text/css" rel="stylesheet" href="MooContentAssist.css" />
	<script src="js/lib/mootools-core-1.3.1-full-nocompat.js"></script>
	<script src="js/lib/mootools-more-1.3.1.1.js"></script>
	<script src="Source/MooContentAssist.js"></script>

3-Istantiate a new MooContentAssist

	<script type="text/javascript>
		window.addEvent("domready",function(){
			var editorAssisted = new MooContentAssist( {
				"source": document.id("myeditor"),
				"vocabulary" : {
					"key0": null,
					"key1": ["subkey1","subkey2","subkey3"],
					"key2": {
						"subsubkey1": null,
						"subsubkey2": ["a","b","c"],
						"subsubkey3": {
							"a": null,
							"b": ["1","2","3"]
						}
					}
				}
			});
		});
	</script>

Parameters / Options Mandatory
------------------------------
 * source - default: null
 * vocabulary - default: null

Parameters / Options Extra
------------------------------
 * frameSize - default: 3
 * animationDuration - default: 75
 * vocabularyDiscoverer - default: true
 * vocabularyUrl - default: null
 * vocabularyUrlParam - default: "ns"
 * vocabularyUrlMethod - default: "get"
 * windowPadding - default: {x: 0 y: 5}
 * itemType - default: "li"
 * itemsContainerType - default: "ul"
 * matchedTextItemType - default: "span"
 * aggressiveAssist - default: true
 * namespaceAllowed - default: ["()", "$"]
 * css.item - default: "item"
 * css.itemsContainer - default: "itemsContainer"
 * css.itemSelected - default: "itemSelected"
 * css.messageItem - default: "message"
 * css.matchedText - default: "matched"
 * labels.nothingFound - default: "Nothing was found."
 * labels.ajaxError - default: "Error while retrieving data."
 * vocabularyManager_Render - default: function(obj) {
 * vocabularyManager_Extract - default: function(namespace,vocabulary) {
 * vocabularyManager_GetVocabulary - default: function(namespace) {

Eeverything works if you give the right json words object.

Use this as root: 

	vocabulary: {
		"key1": 
		"key2": 
		"key3":
	}

If the key doesn't have sub-keys you must use an array with strings:
	
	"key_without_subkeys": ["word1","word2","word3"]

If the key has sub-keys you must use objects:

	"key_with_subkeys": {
		"subkey1": ["word","word","word"],
		"subkey2": ["word","word","word"],
		"subkey3": ["word","word","word"]
	}

Obviously you could have infinite sub-levels :)

Please see index.html in the git repo if you need a working example. :)

ChangeLog
-----------
* 14 Mar 2011 v.080.3 - namespace parser, fixed "charAt()" problem with IE7
* 08 Mar 2011 v.080.2 - namespace parser, now with allowed chars (or strings) in the namespace
* 08 Mar 2011 v.080.1 - configurable items container inside the main box
* 06 Mar 2011 v.080 - MooTools 1.3, several bugfixing, internal API rewritten.* 01 Jul 2010 v0.70.4 - converter from xml to words object, fixed bug on foundlist, fixed bug on assist window position
* 27 Jun 2010 v0.70 - theme changer, new demo with theme toggler
* 11 Jun 2010 v0.70 - configurable number of item shown in the box
* 10 Jun 2010 v0.70 - scrollable result box, scrollable result box shows always the current item in the middle
* 04 Jun 2010 v0.68 - few standard methods for positioning, css rules methods
* 24 May 2010 v0.68 - fixed textarea scroll when inserting keywords, fixed assistWindow position
* 23 May 2010 v0.66 - first dot fixed, occurence text highlight fixed, animation now is a parameter
* 22 May 2010 v0.64 - ie7 fixes
* 21 May 2010 v0.63 - added events "click" and "over" to the shown items, when showing assistWindow first item is already selected, added "." trigger
* 21 May 2010 v0.60 - added styles for items, window positioning 
* 20 May 2010 v0.55 - fixed textarea events
* 16 May 2010 v0.25 - fixed words data structure
* 15 May 2010 v0.15 - added completed text, events and keys
* 13 May 2010 v0.0  - hello word

Screenshots
-----------

![Screenshot 1](http://moocontentassist.altervista.org/img/screenshot.png)

![Screenshot 2](http://moocontentassist.altervista.org/img/screenshot-complex-vocabulary.png)
