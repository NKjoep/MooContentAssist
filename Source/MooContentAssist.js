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
    
        10 Jun 2010 v0.68 - scrollable result box
        04 Jun 2010 v0.68 - few standard methods for positioning, css rules methods
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
	
		Version - 0.68.2
		Date - 04 Jun 2010
		
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
	version: "MooContentAssist v0.68.2",
	Implements: [Events, Options],
	options: {
		animationDuration: 225,
		aniationTransition:  Fx.Transitions.Sine.easeOut,
		css: {
			"activeItem": {
				"margin-bottom": "0.125em",
				"cursor": "pointer",
				"color":"red",
				"background-color": "#51607C",
				"padding": "0.125em 0 0 0",
                "height": "1.5em",
                "display": "block",
                "float": "left",
                "width": "100%"
			},
			"completedItem": {
				"margin-bottom": "0.125em",
				"cursor": "pointer",
				"padding": "0.125em 0 0 0",
                "height": "1.5em",
                "display": "block",
                "float": "left",
                "width": "100%"                
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
				"padding": "6px 0 3px 0",
				"font-family": "arial,helvetica,clean,sans-serif",
				"font-size": "13px",
				"opacity": "0.97",
                "height": "8.75em",
                "overflow": "auto"
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
		/*
		 * Function: initializeVocabulary
		 * 
		 * Gets the words object and build a new Hash()
		 * 
		 */
		
		this.vocabulary = new Hash(this.options.words);		
	},
	initializeEvents: function() {
		/*
		 * Function: initializeEvents
		 * 
		 * It setups the event for the MooContentAssist instance, adding the events: startAssist, hide, show, destroy. 
		 * 
		 */
		this.addEvents({
			"startAssist": function(position){ this.startAssist(position); }.bind(this),	
			"hide": function() { this.hide(); }.bind(this),
			"show": function() { this.show(); }.bind(this),
			"destroy": function() { this.destroy(); }.bind(this)
		});
	},
	initializeTextarea: function(el){
		/*
		 * Function: initializeTextarea
		 * 
		 * Get the element and store it, adds the events and the logic for firing the "startAssist" event.
		 * 
		 */
		
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
		/*
		 * Function: selectItemUp
		 * 
		 * Highlight the previous item from the list. Usually used when the user press the up arrow key.
		 * 
		 */
		var item;
        if ($defined(this.selectedItem) && $defined(this.selectedItem.getPrevious())) {
            item = this.selectedItem.getPrevious();
		} 
		else { 
			//TODO : refactor, make configurable "ul" and "li"
            item = this.assistWindow.getLast("ul").getLast("li");
		}
        this.selectItem(item);
        this.scrollToItem(item);
	},
	selectItemDown: function() {
		/*
		 * Function: selectItemDown
		 * 
		 * Highlight the next item from the list. Usually used when the user press the down arrow key.
		 * 
		 */
		var item;
        if ($defined(this.selectedItem) && $defined(this.selectedItem.getNext())) {
            item = this.selectedItem.getNext();
		} 
		else { 
			//TODO : refactor, make configurable "ul" and "li"
            item = this.assistWindow.getFirst("ul").getFirst("li");
		}
        this.selectItem(item);
        this.scrollToItem(item);
	},
    scrollToItem: function(item) {
            var assistWindowScroller = new Fx.Scroll(this.assistWindow,{
                    duration: 0,
                    offset: {"x": 0, "y": this.assistWindow.getStyle('padding-top').toInt()*-1}
                    
                });
            //item height
            var i = item.getComputedSize({"styles": ["margin","padding","border"]}).totalHeight;
            //box height
            var f = (this.assistWindow.getComputedSize({"styles": ["padding"]}).totalHeight/i); f = f.toInt();
            //current item
            var c = this.assistWindow.getElements('li').indexOf(item);
            //index
            var v1 = (c/f).toInt(); v1 = v1 * f; 
            //scroll to item at that index
            assistWindowScroller.toElement(this.assistWindow.getElements('li')[v1]);
    },
	selectItem: function(item) {
		/*
		 * Function: selectItem
		 * 
		 * Gets an item and highlights it. Always called from selectItemUp and selectItemDown functions.
		 * 
		 * Parameters:
		 * item -  the item to highlight
		 *  
		 */
		if ($defined(this.selectedItem) && $defined(item) && $chk(item.get("text")) ) {
			this.removeCss(this.selectedItem,this.options.css.activeItem);
			this.applyCss(this.selectedItem,this.options.css.completedItem);
		}
		if ($defined(item) && $chk(item.get("text"))) {
			var start;
			if (this.namespace.getLast() == "/") { start = 0; }
			else { start = this.namespace.getLast().length};			
			this.selectedItem = item;
			this.completedText = item.get("text").substring(start); 			
			this.removeCss(item,this.options.css.completedItem);
			this.applyCss(item,this.options.css.activeItem);
		}
	},
	useSelectedItem: function() {
		/*
		 * Function: useSelectedItem
		 * 
		 * Gets the text from the current highlighted item and writes it to the textarea.
		 *
		 */
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
		/*
		 * Function: destroy
		 * 
		 * This will destroy the assistedWindow and the items list calling the hide function
		 * 
		 */
		if ($defined(this.assistWindow)) { 
			this.hide();
			//this.assistWindow.destroy(); 
		}
		this.assistWindow = null;
	},
	hide: function() {
		/*
		 * Function: hide
		 * 
		 * Will hide the window with the item
		 * 
		 */
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
		/*
		 * Function: show
		 * 
		 * Will show the window with the items.
		 * 
		 */
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
		/*
		 * Function: startAssist
		 * 
		 * Will check for the current "namespace" and lets start rock.
		 * 
		 * Parameters:
		 * position - {Number} The textarea position where start to read
		 * 
		 */
		if (!$defined(position)) position = this.editorTextarea.getCaretPosition();
		this.position = position;
		this.destroy();			
		this.namespace = this.findNameSpaceElements(position);
		if ($chk(this.namespace)) {
			this.doAssist();
		} 
	},
	findNameSpaceElements: function(position) {
		/*
		 * Function: findNameSpaceElements
		 * 
		 * Will discovere where the namespace or the object tree.
		 * 
		 * Parameters:
		 * position - {Number} The textarea position where start to read
		 * 
		 * Returns: 
		 * {Array} the namespace
		 * 
		 */
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
		/*
		 * Function: doAssist
		 * 
		 * It will read the already discovered namespace and will get the right items from the vocabulary. 
		 * When something useful is found will call the makeAssistWindow function.
		 * 
		 */
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
		/*
		 * Function: makeAssistWindow
		 * 
		 * Will build the element containing the help.
		 * 
		 * Parameters:
		 * foundList - {Array} The vocabulary found for the current namespace
		 * 
		 */
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
			w.position({
				relativeTo: this.editorTextarea,
				position: 'bottomLeft',
				edge: 'upperLeft'			
			});			
			this.assistWindow = w;
			this.applyCss(w,this.options.css.assistWindow);
		} else { 
			w = this.assistWindow; 
			w.empty();
		}
		this.selectedItem = null;
		this.fireEvent("show");
		if (foundList.length > 0) {
			this.assistList = new Element("ul").inject(this.assistWindow);
			this.applyCss(this.assistList,this.options.css.assistList);
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
	applyCss: function(el,css) {
		/*
		 * Function: applyCss
		 * 
		 * Check and apply the css passed. Css parameter could be a "Style Object" or a String. If passed a string a css class with that name will be added to the element. 
		 * 
		 * Parameters:
		 * el - {Element} the element to apply the css properties 
		 * css - {Object|string} the css properties
		 */
		if ($defined(css)) {
			if ($type(css)=="object") el.setStyles(css);
			else if ($type(css)=="string") el.addClass(css);
		}		
	},
	removeCss: function(el,css) {
		/*
		 * Function: removeCss
		 * 
		 * Removes the css properties passed. If css is a string that class will be removed otherwise the style will be resetted.
		 * 
		 * Parameters:
		 * el - {Element} the element to remove the css properties 
		 * css - {Object|string} the css properties
		 * 
		 */
		if ($defined(css)) {
			if ($type(css)=="string") el.removeClass(css);
			else el.set("style","");
		}		
	},
	makeAssistItem: function(item) {
		/*
		 * Function: makeAssistItem
		 * 
		 * Will build the an item to add to the list.
		 * 
		 * Parameters:
		 * item - {Object|String} the text of the item in the assistedWindow list  
		 * 
		 */
		if ($type(item) == "object") item = new Hash(item).getKeys()[0];
		var occurencePosition = this.namespace.getLast()=="/" ? 0 : this.namespace.getLast().length;  
		var occurrence = item.substring(0,occurencePosition);
		var completedText = item.substring(occurencePosition,item.length);
		var itemEl = new Element("li").inject(this.assistList);
		this.applyCss(itemEl,this.options.css.completedItem);
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
		this.applyCss(occurrenceEl,this.options.css.occurence);
		var completedEl = new Element("span",{ "text": completedText}).inject(itemEl,"bottom");
		this.applyCss(completedEl,this.options.css.completedText);
	},
	checkString: function(a,b) {
		/*
		 * Function: checkString
		 * 
		 * checkString returns true when the "a" string starts with the "b" string.
		 * 
		 * Parameters:
		 * a - {String} the string to test
		 * b - {String} the pattern to match
		 * 
		 * Returns:
		 * true|false
		 */
		var b = b.replace(/\./gi, "\\\\.").replace(/\[/gi, "\\\[").replace(/\]/gi, "\\\]").replace(/\{/gi, "\\\{").replace(/\}/gi, "\\\}").replace(/\(/gi, "\\\(").replace(/\)/gi, "\\\)").replace(/\^/gi, "\\\^").replace(/\|/gi, "\\\|").replace(/\*/gi, "\\\*").replace(/\$/gi, "\\\$");
		var test = a.test("^"+b,"i"); 
		return test; 
	}
});
