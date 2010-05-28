/*
---

description: A content assist for textares of your webpage.

license: GNU General Public License, version 2.

authors:
- Andrea Dessì

requires:
 core/1.2.4:
  - all
 more/1.2.2.4:  
  - Element.Forms 

provides: [MooContentAssist]

...
*/

/*
    Title: MooContentAssist Doc Reference
*/

/*
    Class: MooContentAssist
    
    It adds a content/code assist functionality to your textareas.

    Changelog:
    
        24 May 2010 v0.68 - fixed textarea scroll when inserting keywords, fixed assistWindow position
        23 May 2010 v0.66 - first dot fixed, occurence text highlight fixed, animation now is a parameter
        22 May 2010 v0.64 - ie7 fixes
        21 May 2010 v0.63 - added events "click" and "over" to the shown items, when showing assistWindow first item is already selected, added "." trigger
        21 May 2010 v0.60 - added styles for items, window positioning 
        20 May 2010 v0.55 - fixed textarea events
        16 May 2010 v0.25 - fixed words data structure
        15 May 2010 v0.15 - added completed text, events and keys
        13 May 2010 v0.0  - hello word	
    
    Info:
	
		Version - 0.68
		Date - 24 May 2010
		
	Parameters:
	
	    el - {String} The html id of the textarea
	    options - {Object} An Object containing all the setting
    
    The Options Object:
        The option object has this properties:

        animationDuration - {Number}{Default 225}. It defines how long will be the show/hide animation
        css - {Object} Contains all the css properties objects for the content assist window elements
        css.assistWindow - {String|Object} The css class/properties for the container of everything
        css.assistList - {String|Object} The css class/properties for the container of the items
        css.completedItem - {String|Object} The css class/properties for the container of single item in the list
        css.activeItem - {String|Object} The css class/properties for highlighted/active item from the list 
        css.occurence - {String|Object} The css class/properties for the matched text in the keyword
        css.completedText - {String|Object} The css class/properties for the completed/help text in the keyword
        words - {Object} The vocabulary.
    
    
    The Words Vocabulary Object:
        Everything works if you give the right json words object. Use this as root:
        
        (start code)
words: {
    "key1":
    "key2":
    "key3":
}        
        (end)
        
        Then put in the *words* object your keys. 
        If the key doesn't have subkey, so it has just children keywords, use the array form:
        
        (start code)
"key_without_subkeys": ["word1","word2","word3" ...]
        (end)
        
        If the key has subkeys, use the object form:
        (start code)
"key_with_subkeys":  {
    "subkey1": ["word","word","word" ...],
    "subkey2": ["word","word","word" ...],
    ...
}
        (end)
        
        The exaple with mixed keys (with and without subkeys)
        (start code)
words: {
    "key1": ["a","b","c"],
    "key2": [null],
    "key3": {
       "subkey1": {
           "subsub1": ["tr","ol","ololo"],
           "subsub2": ["ulla","lala","laaaa"],
           "subsub3": [null]
       },
       "subkey2": ["test1","test2","test3"],
       "subkey3": ["weeeeeeeeee!"]
    }
}     
        (end)
        
        
*/
var MooContentAssist = new Class({
	v: "MooContentAssist v0.68",
	Implements: [Events, Options],
	options: {
		animationDuration: 225,
		aniationTransition:  Fx.Transitions.Sine.easeOut,
		css: {
			"activeItem": {
				"margin-bottom": "3px",
				"cursor": "pointer",
				"color":"red",
				"background-color": "#51607C",
				"padding": "0 0 0 0"
			},
			"completedItem": {
				"margin-bottom": "3px",
				"cursor": "pointer",
				"padding": "0 0 0 0"
			},
			"assistList": {
				"margin": "0",
				"padding": "0",
				"list-style-type": "none"
			},
			"occurence": {
				"color": "#8DBBD9",
				"font-weight": "bold",
				"margin-left": "5px"
			},
			"completedText": {
				"color": "#fff"	
			},
			"assistWindow": {
				"border": "1px solid black",
				"background-color": "#414E67",
				"padding": "3px 0 3px 0",
				"font-family": "arial,helvetica,clean,sans-serif",
				"font-size": "13px",
				"opacity": "0.97"
			}
		},		
		//toggler option is not in use. still TODO
        toggler: "toggler",
		words: { }
	},
	initialize: function(el, options){
		if ($defined(el)) {
			this.setOptions(options);
			this.initializeEvents();
			this.initializeTextarea(el);
			this.initializeVocabulary();
			this.initializeTogglers();
		}
	},
	initializeTogglers: function() {
		if ($defined(this.options.toggler)) {
			//TODO
		}
	},
	initializeVocabulary: function(){
		this.vocabulary = new Hash(this.options.words);		
	},
	initializeEvents: function() {
		this.addEvents({
			"startAssist": function(position){ this.startAssist(position); }.bind(this),	
			"hide": function() { this.hide(); }.bind(this),
			"show": function() { this.show(); }.bind(this),
			"destroy": function() { this.destroy(); }.bind(this)
		});
	},
	initializeTextarea: function(el){
		this.editorTextarea = document.id(el); 
		this.editorTextarea.addEvents({
			"keydown": function(ev) {
					
					if ( (ev.control || ev.alt) && ev.key == "space" ) {
						ev.preventDefault();
						this.fireEvent("startAssist",ev.target.getCaretPosition());
					}
					else if ($defined(this.assistWindow) && ((ev.key == "up") || (ev.key == "down"))) {
						ev.preventDefault();
					}
					else if ($defined(this.assistWindow) && ev.key == "esc") {
						this.fireEvent("destroy");
					}
					/* fix for webkit/trident - start */
					if ($defined(this.assistWindow) && (Browser.Engine.webkit || Browser.Engine.version == 6 || Browser.Engine.version == 5)){
						if (ev.key == "up") {
							ev.preventDefault();
							this.selectItemUp();
						}
						else if (ev.key == "down") {
							ev.preventDefault();
							this.selectItemDown();
						}
						else if (ev.key == "enter" && $defined(this.selectedItem)) {
							ev.preventDefault();
							this.useSelectedItem();						
							this.fireEvent("destroy");
						}
						else if (ev.key == "enter" && !$defined(this.selectedItem)) {
							this.fireEvent("destroy");
						}
					} 
					/* fix for webkit/trident - end */
				}.bind(this),
			"keypress": function(ev) {
					if ($defined(this.assistWindow)) {
						if (ev.key == "up") {
							ev.preventDefault();
							this.selectItemUp();
						}
						else if (ev.key == "down") {
							ev.preventDefault();
							this.selectItemDown();
						}
						else if (ev.key == "enter" && $defined(this.selectedItem)) {
							ev.preventDefault();
							this.useSelectedItem();
							this.fireEvent("destroy");
						}
						else if (ev.key == "enter" && !$defined(this.selectedItem)) {
							this.fireEvent("destroy");
						}
					}
				}.bind(this),				
			"keyup": function(ev) {
					if (((ev.control || ev.alt) && ev.key == "space" ) || ev.key == "alt" || ev.key == "control") { }
					else if ($defined(this.assistWindow) && ev.key != "shift") {
						if ((ev.key != "up" && ev.key != "down") || (ev.key == ".")) {
							this.fireEvent("startAssist",this.editorTextarea.getCaretPosition());
						}
					}
					else if ($defined(this.assistWindow) && ev.key == ".") {
						this.fireEvent("startAssist",this.editorTextarea.getCaretPosition());
					}
				}.bind(this)
		});
	},
	selectItemUp: function() {
		if ($defined(this.selectedItem) && $defined(this.selectedItem.getPrevious())) {
			this.selectItem(this.selectedItem.getPrevious());
		} 
		else { 
			//TODO : refactor, make configurable "ul" and "li"
			this.selectItem(this.assistWindow.getLast("ul").getLast("li")); 
		}
	},
	selectItemDown: function() {
		if ($defined(this.selectedItem) && $defined(this.selectedItem.getNext())) {
			this.selectItem(this.selectedItem.getNext());
		} 
		else { 
			//TODO : refactor, make configurable "ul" and "li"
			this.selectItem(this.assistWindow.getFirst("ul").getFirst("li")); 
		}
	},
	selectItem: function(item) {
		if ($defined(this.selectedItem) && $defined(item) && $chk(item.get("text")) ) {
			if ($defined(this.options.css.activeItem)) {
				if ($type(this.options.css.activeItem) == "object") {
					this.selectedItem.set("style","");
				}
				if ($type(this.options.css.activeItem) == "string") {
					this.selectedItem.removeClass(this.options.css.activeItem);			
				}
			}
			if ($defined(this.options.css.completedItem)) {
				if ($type(this.options.css.completedItem) == "object") {
					this.selectedItem.setStyles(this.options.css.completedItem);
				}
				if ($type(this.options.css.completedItem) == "string") {
					this.selectedItem.addClass(this.options.css.completedItem);			
				}
			}
		}
		if ($defined(item) && $chk(item.get("text"))) {
			var start;
			if (this.namespace.getLast() == "/") { start = 0; }
			else { start = this.namespace.getLast().length};			
			this.selectedItem = item;
			this.completedText = item.get("text").substring(start); 			
			if ($defined(this.options.css.completedItem)) {
				if ($type(this.options.css.completedItem) == "object") {
					item.set("style","");
				}
				else if ( $type(this.options.css.completedItem) == "string" ) {
					item.removeClass(this.options.css.completedItem);			
				} 
			}
			if ($defined(this.options.css.activeItem)) {
				if ($type(this.options.css.activeItem) == "object"){
					item.setStyles(this.options.css.activeItem);
				}
				else if ($type(this.options.css.activeItem) == "string") {
					item.addClass(this.options.css.activeItem);			
				}
			}
		}
	},
	useSelectedItem: function() {
		if($defined(this.completedText)) {
			var scrollTop = this.editorTextarea.scrollTop;
			var position = this.editorTextarea.getCaretPosition();
			var textbefore = this.editorTextarea.get("value").substring(0, position);
			var textafter = this.editorTextarea.get("value").substring(position);
			this.editorTextarea.set("value", textbefore + this.completedText + textafter);
			this.editorTextarea.setCaretPosition(textbefore.length + this.completedText.length);
			//this.editorTextarea.focus();
			this.editorTextarea.scrollTop = scrollTop;
			this.completedText=null;
		}
		this.fireEvent("destroy");		
	},
	destroy: function() { 
		if ($defined(this.assistWindow)) { 
			this.hide();
			//this.assistWindow.destroy(); 
		}
		this.assistWindow = null;
	},
	hide: function() {
		var fx = new Fx.Morph(this.assistWindow, {
			duration: this.options.animationDuration, 
			onChainComplete: function() {
				this.destroy();
			}.bind(this.assistWindow),
			transition: this.options.aniationTransition
		});
		fx.set({"opacity":1});
		fx.start({
		    'opacity': 0
		});
	},
	show: function() {
		var fx = new Fx.Morph(this.assistWindow, {
			duration: this.options.animationDuration, 
			transition: this.options.aniationTransition
		});
		fx.set({"opacity":0});
		fx.start({
		    'opacity': 1
		});
	},
	startAssist: function(position) {
		if (!$defined(position)) position = this.editorTextarea.getCaretPosition();
		this.position = position;
		this.destroy();			
		this.namespace = this.findNameSpaceElements(position);
		if ($chk(this.namespace)) {
			this.doAssist();
		} 
	},
	findNameSpaceElements: function(position) {
		var namespace = null;
		var endPosition = position;
		position=position-1;
		if ($type(position) == "number") {
			var test = true;
			var previousChar = "";
			while(position >= 0 && test) {
				var c = this.editorTextarea.get("value").substring(position,position+1)
				if (!(/\S/.test(c))) { test = false; }
				else {
					if (previousChar=="" && c==""){
						test = false;
						position = position+1;
					}
					else {
						previousChar = c;
						position = position-1;
					}
				}			
			}
			var namespaceFlat = this.editorTextarea.get("value").substring(position+1,endPosition).trim();
			if (namespaceFlat.length > 0 && namespaceFlat != ".") {
				namespace = namespaceFlat.split(".");
				if (namespace[namespace.length-1] == "") namespace[namespace.length-1] = "/"; 
			}
			else if (namespaceFlat.length == 0 && namespaceFlat == "") {
				namespace = ["/"];
			}
		}
		return namespace;	
	},
	doAssist: function() {
		var namespace = this.namespace;
		if($chk(namespace)) {
			var foundList = [];
			var vocabulary = this.vocabulary;
			if (namespace.length > 1) {
				var arrayNotation="";
				for (var i = 0; i < namespace.length-1; i++) {
					if (!(i == namespace.length-1 && namespace[i] == "/" )) {
						arrayNotation = arrayNotation + "['" + namespace[i] + "']";
					}
				} 
				try {
					vocabulary = eval("vocabulary.getClean()"+arrayNotation);
					if($type(vocabulary) == "object") {
						vocabulary = new Hash(vocabulary).getKeys();
					}
				} catch (e) { }
			} else {
				vocabulary = vocabulary.getKeys();
			}
			if($defined(vocabulary) && $chk(vocabulary) && $type(vocabulary) == "array" && vocabulary.length > 0 ) {
				var lastWord = this.namespace.getLast();
				if ($chk(lastWord) && lastWord != "/") {
					vocabulary.each(function(item,index){
						if ($type(item) == "object") item = new Hash(item).getKeys()[0];
						if(this.checkString(item,lastWord)) {
							foundList.push(item);
						}
					}.bind(this));
				} 
				else {
					foundList = vocabulary;				
				}				
			}
			if (foundList.length > 0) { 
				this.makeAssistWindow(foundList);
				this.selectItemDown();
			}
		}		
	},
	makeAssistWindow: function(foundList) {
		var scrollTop = this.editorTextarea.scrollTop;
		foundList.sort();
		var w;
		if (!($defined(this.assistWindow) && document.id(this.assistWindow))) {
			w = new Element("div",{
				"styles": { 
					"width": this.editorTextarea.getSize().x-2,
					"position": "absolute",
					"opacity": "0"
				}
			}).inject(this.editorTextarea,"after");
			w.setPosition({
				x: this.editorTextarea.getCoordinates().left,
				y: this.editorTextarea.getCoordinates().top+this.editorTextarea.getScrollTop()+this.editorTextarea.getSize().y
			});
			w.setStyles({
				"left":this.editorTextarea.getCoordinates().left,
				"top": this.editorTextarea.getCoordinates().top+this.editorTextarea.getScrollTop()+this.editorTextarea.getSize().y
			});
			this.assistWindow = w;
			if ($defined(this.options.css.assistWindow)) {
				if ($type(this.options.css.assistWindow=="object")) w.setStyles(this.options.css.assistWindow);				
				else if ($type(this.options.css.assistWindow)=="string") {w.addClass(this.options.css.assistWindow);}
			}
		} else { 
			w = this.assistWindow; 
			w.empty();
		}
		this.selectedItem = null;
		this.fireEvent("show");
		if (foundList.length > 0) {
			this.assistList = new Element("ul").inject(this.assistWindow);
			if ($defined(this.options.css.assistList)) {
				if ($type(this.options.css.assistList)=="object") this.assistList.setStyles(this.options.css.assistList);
				else if ($type(this.options.css.assistList)=="string") this.assistList.addClass(this.options.css.assistList);
			}
		}
		var versionEl = new Element("span",{ 
			text: this.version, 
			styles:{
				"color": "#596A88",
				"margin": 0,
				"padding": 0, 
				"position": "absolute",
				"font-size": "9px",
				"top": "0",
				"width": "100%",
				"background-color": "transparent",
				"text-align": "right"
		}}).inject(this.assistWindow);
		
		versionEl.setStyles({
			"left": 0
		});
		foundList.each(function(item, index){
			this.makeAssistItem(item);
		}.bind(this));
		this.editorTextarea.scrollTop = scrollTop;
	},
	makeAssistItem: function(item) {
		if ($type(item) == "object") item = new Hash(item).getKeys()[0];
		var occurencePosition = this.namespace.getLast()=="/" ? 0 : this.namespace.getLast().length;  
		var occurrence = item.substring(0,occurencePosition);
		var completedText = item.substring(occurencePosition,item.length);
		
		var itemEl = new Element("li").inject(this.assistList);
		if ($defined(this.options.css.occurence)) {
			if ($type(this.options.css.completedItem)=="object") itemEl.setStyles(this.options.css.completedItem);
			else if ($type(this.options.css.completedItem)=="string") itemEl.addClass(this.options.css.completedItem);
		}		
		itemEl.addEvents({
			"click": function(ev){ 
				ev.stopPropagation();
				this[0].selectItem(this[1]);
				this[0].useSelectedItem();
			}.bind([this,itemEl]),
			"mouseover": function(ev) {
				this[0].selectItem(this[1]);
			}.bind([this,itemEl])
		});
		var occurrenceEl = new Element("span",{ "text": occurrence }).inject(itemEl,"top");
		if ($defined(this.options.css.occurence)) {
			if ($type(this.options.css.occurence)=="object") occurrenceEl.setStyles(this.options.css.occurence);
			else if ($type(this.options.css.occurence)=="string") occurrenceEl.addClass(this.options.css.occurence);
		}
		var completedEl = new Element("span",{ "text": completedText}).inject(itemEl,"bottom");
		if ($defined(this.options.css.completedText)) {
			if ($type(this.options.css.completedText)=="object") completedEl.setStyles(this.options.css.completedText);
			else if ($type(this.options.css.completedText)=="string") completedEl.addClass(this.options.css.completedText);
		}
	},
	checkString: function(a,b) {
		var b = b.replace(/\./gi, "\\\\.").replace(/\[/gi, "\\\[").replace(/\]/gi, "\\\]").replace(/\{/gi, "\\\{").replace(/\}/gi, "\\\}").replace(/\(/gi, "\\\(").replace(/\)/gi, "\\\)").replace(/\^/gi, "\\\^").replace(/\|/gi, "\\\|").replace(/\*/gi, "\\\*").replace(/\$/gi, "\\\$");
		var test = a.test("^"+b,"i"); 
		return test; 
	}
});