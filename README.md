MooContentAssist
===========

MooContentAssist is a javascript library that add a content assist feature to textareas in your webpage.

This library is based on MooTools.

MooContentAssist works with: FireFox, Chrome/Chromium, Safari, IE7/8.

Features
----------
 * Configurable results window size
 * Configurable vocabulary object/namespace
 * Configurable animation type/duration
 * Configurable with obj-style or css classes
 * Full working with FireFox, Chrome/Chromium, Safari, IE7/8 

How to use
----------

You need a textarea with the html id, example:
    
    #HTML
    <textarea id="myeditor"></textarea>

Then include the MooContentAssist.js, and add this script for a new istance:
   
    #JS
    window.addEvent("domready",function(){
        new MooContentAssist("myeditor",{
            words: {
                "$content": {
                    "Immagine": ["getImagePath(\"\")","text"],
                    "CorpoTesto":  ["text","textBeforeImage(0)","textAfterImage(0)","textByRange(0,0)"],
                    "Abstract":  ["text"],
                    "Allegati":  ["size()"],
                    "categories":  [null],
                    "DataInizio":  ["shortDate","fullDate","mediumDate","getFormattedDate(\"\")"],
                    "DataFine":  ["shortDate","fullDate","mediumDate","getFormattedDate(\"\")"],
                    "SitoWeb": ["destination","text"]
                },
                "$18n": ["getLabel(\"\")"],
                "a": ["a1111","a2222","a33333"],
                "albatros": ["quack"],
                "b": ["bbb111","bbbbb2222","word-b2"],
                "babbalotto": ["ouch"],
                "c": [null],
                "contentAssist": ["help","editor","start"]
            }
        });
    });


Eeverything works if you give the right json words object.
Use this as root: 

    #JS
    words: {
       "key1": 
       "key2": 
       "key3":
    
    }

If the key doesn't have sub-keys you must use an array with strings:

	#JS
	"key_without_subkeys": ["word1","word2","word3"]

If the key has sub-keys you must use objects:

	#JS
	"key_with_subkeys": {
	  "subkey1": ["word","word","word"],
	  "subkey2": ["word","word","word"],
	  "subkey3": ["word","word","word"]
	}

Obviously you could have infinite levels :)

Please see index.html in the git repo if you need a working example. :)

ChangeLog
-----------
* 01 Jul 2010 v0.70.4 - converter from xml to words object
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

![Screenshot 1](http://github.com/NKjoep/MooContentAssist/raw/master/img/screenshot.png)