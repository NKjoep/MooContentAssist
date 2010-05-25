MooContentAssist
===========

MooContentAssist is a javascript library that add a content assist feature to textareas in your webpage.

This library is based on MooTools.

MooContentAssist works with: Firefox, Chrome, IE7, IE8. Untested with Safari.

How to use
----------

You need a textarea with the html id <textarea id="myeditor"></textarea>

Then include the MooContentAssist.js, and add this script for a new istance:
   
    #JS
    window.addEvent("domready",function(){
        new MooContentAssist("editor",{
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

Obviously you have infinite levels :)

Please see index.html in the git repo if you need a working example. :)

Screenshots
-----------

![Screenshot 1](http://github.com/NKjoep/MooContentAssist/raw/master/img/screenshot.png)