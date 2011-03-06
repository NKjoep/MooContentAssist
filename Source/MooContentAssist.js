var mca = {
	version: "MooContentAssist v0.80",
	Implements: [Events, Options],
	options: {
		source: null,
		frameSize: 3,
		animationDuration: 75,
		vocabulary: null,
		vocabularyDiscoverer: true,
		vocabularyUrl: null,
		vocabularyUrlParam: "ns",
		vocabularyUrlMethod: "get",
		windowPadding: {x: 0, y: 5},
		itemType: "p",
		aggressiveAssist: true,
		namespaceDelimiters: [" ","\n","\t","\"",",",";","=","(",")","[","]",";","{","}","<",">","+","-",'\\',"!","&","|"],
		css : {
			item: "item",
			itemSelected: "itemSelected",
			messageItem: "message" 
		},
		labels: {
			nothingFound: "Nothing was found.",
			ajaxError: "Error while retrieving data."
		},
		vocabularyManager_Render: function(obj) {
			var rendered = new Element(this.options.itemType,{text: obj, "class": this.options.css.item});;
			rendered.store("value",obj);
			return rendered; 
		},
		vocabularyManager_Extract: function(namespace,vocabulary) {
			if (namespace[0] == "") { 
				namespace=Array.clone(namespace);
				namespace.shift(); 
			}
			var vocabularyFound = [];
			var found = null;
			var searchKey = null;
			if (namespace.length == 1){
				found = vocabulary; 
				if (namespace[0] != "/") {
					searchKey = namespace[0];
						searchKey = searchKey.replace(/\*/g,"\\\*");
						searchKey = searchKey.replace(/\./g,"\\\.");
						searchKey = searchKey.replace(/\?/g,"\\\?");
						searchKey = searchKey.replace(/\[/g,"\\\[");
						searchKey = searchKey.replace(/\]/g,"\\\]");
						searchKey = searchKey.replace(/\(/g,"\\\(");
						searchKey = searchKey.replace(/\)/g,"\\\)");
						searchKey = searchKey.replace(/\{/g,"\\\{");
						searchKey = searchKey.replace(/\}/g,"\\\}");
						searchKey = searchKey.replace(/\^/g,"\\\^");
						searchKey = searchKey.replace(/\$/g,"\\\$");
				}
			}
			else if (namespace.length > 1) {
				if (namespace[namespace.length-1] != "/") {
					searchKey = namespace[namespace.length-1];
						searchKey = searchKey.replace(/\|/g,"\\\|");
						searchKey = searchKey.replace(/\*/g,"\\\*");
						searchKey = searchKey.replace(/\./g,"\\\.");
						searchKey = searchKey.replace(/\?/g,"\\\?");
						searchKey = searchKey.replace(/\[/g,"\\\[");
						searchKey = searchKey.replace(/\]/g,"\\\]");
						searchKey = searchKey.replace(/\(/g,"\\\(");
						searchKey = searchKey.replace(/\)/g,"\\\)");
						searchKey = searchKey.replace(/\{/g,"\\\{");
						searchKey = searchKey.replace(/\}/g,"\\\}");
						searchKey = searchKey.replace(/\^/g,"\\\^");
						searchKey = searchKey.replace(/\$/g,"\\\$");
				}
				namespace=Array.clone(namespace);
				namespace.pop();
				var tempFound = vocabulary;
				for (var i=0;i<namespace.length;i++) {
					try {
						tempFound = tempFound[namespace[i]];
					}
					catch (e) {
						tempFound = null;
					}
				}
				found = tempFound;
			}
			if (null != found) {
				if(typeOf(found)=="object") {
					Object.each(found,function(value,key){
						if (searchKey == null || key.test("^"+searchKey,"i")) {
							vocabularyFound.push(key);
						}
					});
				}
				else if(typeOf(found)=="array") {
					Array.each(found,function(item,index,object) {
						if(typeOf(item)=="string" || typeOf(item)=="number") {
							item = item.toString();
							if (item.length>0) {
								if (searchKey == null || item.test("^"+searchKey,"i")) {
									vocabularyFound.push(item.toString());
								}	
							}
						}
					});
				}
				vocabularyFound.sort();
			}
			return vocabularyFound;
		},
		vocabularyManager_GetVocabulary: function(namespace) {
			var currentNamespace = namespace;
			this._currentVocabulary = null;
			var extractedVocabulary = null;
			if (typeOf(this.options.vocabularyUrl)=="string") {
				var namespaceData = this.options.vocabularyUrlParam+"="+currentNamespace.join("."); 
				if (this.vocabularyRequest==undefined) {
					this.vocabularyRequest = new Request.JSON({
						secure: true,
						url: this.options.vocabularyUrl,
						method: this.options.vocabularyUrlMethod,
						//data: namespaceData,
						async: false,
						link: "cancel",
						onSuccess: function(obj) {
							this.currentVocabulary = obj;
						},
						onFailure: function(xhr) {
							var messageEl = this._createMessage(this.options.labels.ajaxError);
							this.setAssistWindowContent(messageEl);
						}.bind(this)
					});
				}
				else {
					this.vocabularyRequest.cancel();
				}
				this.vocabularyRequest.currentVocabulary = null;
				var reqObj = {};
				reqObj[this.options.vocabularyUrlParam] = currentNamespace;
				this.vocabularyRequest.send(namespaceData);
				extractedVocabulary = this.options.vocabularyManager_Extract.call(this,currentNamespace,this.vocabularyRequest.currentVocabulary);
			}
			else {
				extractedVocabulary = this.options.vocabularyManager_Extract.call(this,currentNamespace,this.options.vocabulary);
			}
			return extractedVocabulary;
		}
	},
	_checkFocus: function(target) {
		var t = target;
		var s = this.options.source;
		var assistWindow = this.getAssistWindow();
		var checkA = (assistWindow!=null) && (t == assistWindow || assistWindow.contains(t)); 
		var checkB = (t == s || s.contains(t));
		if (t==window) return false;
		else if (checkA || checkB) return true;
		else {
			return false;
		}
	},
	_createMessage: function(text) {
		var m =	messageEl = new Element(this.options.itemType, {
			"class": this.options.css.messageItem,
			"text": text
		});
		return m;
	},
	_discoverUserVocabulary: function(namespace) {
		var found = [];
		if (namespace.length==1) {
			namespace = namespace[0];
			var that = this;
		    found = this._discoverWords(this.getSourceValue());
			found = found.filter(function(item, index){
				var check = false;
				if (namespace == "/") {
					check = true;
				}
				else if (namespace==item) {
					check = false;
				}
				else if (item.substring(0,(namespace.length)).toLowerCase() == namespace)  {
					check = true;
				}
				return check;
			});
			found.sort();
		}
		return found;
	},
	_discoverWords: function(str){
		str = str.replace(/\W/g," ").clean().split(" ").clean().unique();
		var tmp = [];
		str.each(function(item, index){
			if (item.length > 3) {
			tmp.push(item.clean());
			}
		});
		str = tmp;
		//str = str.clean().unique();
    	return str;
    },
	_eventManager: function() {
		this.addEvents({
			"start": function(mca) { this.start(); }.bind(this),
			"end": function(mca) { this.end(); }.bind(this)
		});
		var myKeyboardEvents = new Keyboard({
	        active: false,
	        events: {
	            "alt+space": function(ev){
					if (this.getAssistWindow()!=null) {
						//console.log("already assisting!");
						ev.preventDefault();
					}
					else {
						//console.log("start assist");
		                ev.preventDefault();
						this.fireEvent("start",this);
					}
	            }.bind(this),
	            "control+space": function(ev){
					//console.log("already assisting!");
					if (this.getAssistWindow()!=null) {
						ev.preventDefault();
						this.fireEvent("start",this);
					}
					else {
		                //console.log("start assist");
		                ev.preventDefault();
						this.fireEvent("start",this);
					}
	          	}.bind(this),
				"up": function(ev) {
					//console.log("select item up");
					if (this.getAssistWindow()!=null) {
						ev.preventDefault();
						this.selectItemUp();
					}
				}.bind(this),
				"down": function(ev) {
					//console.log("select item down");
					if (this.getAssistWindow()!=null) {
						ev.preventDefault();
						this.selectItemDown();
					}
				}.bind(this),
				"esc": function(ev) {
					//console.log("close it!");
					if (this.getAssistWindow()!=null) {
						ev.preventDefault();
						this.fireEvent("end",this);
					}
				}.bind(this),
				"tab": function(ev) {
					//console.log("close it!");
					if (this.getAssistWindow()!=null) {
						ev.preventDefault();
						this.fireEvent("end",this);
					}
				}.bind(this),
				"enter": function(ev) {
					//console.log("use the item! and destroy it!");
					if(this.getAssistWindow()!=null && this.getItemSelected()!=null) {
						ev.preventDefault();
						this._useItemSelected();
						this.fireEvent("end",this);
					}
				}.bind(this),
				"keyup:delete": function(ev){ 
					if(this.getAssistWindow()!=null) {
						this.fireEvent("start",this); 
					}
				}.bind(this),
				"keyup:cancel": function(ev){ 
					if (this.getAssistWindow()!=null) {
						this.fireEvent("start",this); 
					}
				}.bind(this),
				"keyup:backspace": function(ev){ 
					if (this.getAssistWindow()!=null) {
						this.fireEvent("start",this);
					}
				}.bind(this),
				"keyup:space": function(ev){ 
					this.fireEvent("end",this);
				}.bind(this)
	        }
	    });
		var that = this;
		this.options.source.addEvents({
			"focus": function(ev) {
				this[1]._setSourceCaretPosition();
				this[0].activate();				
			}.bind([myKeyboardEvents,this]),
			"blur": function(ev) {
				this[0].deactivate();
				if (!this[1]._checkFocus(ev.target)) {
					this[1].fireEvent("end",this[1]);
				}
			}.bind([myKeyboardEvents,this]),
			"keyup": function(ev){
				this._setSourceCaretPosition();
				if (this.getAssistWindow()!=null||this.options.aggressiveAssist) {
					if(ev.key.length == 1 && ev.key.test(/^\w$/)) {
						this.fireEvent("start",this);
					}	
				}
			}.bind(this),
			"keypress": that._setSourceCaretPosition.bind(this),
			"keydown":  that._setSourceCaretPosition.bind(this)
		});
		this.options.source.set("autocomplete","off");
        this.options.source.setProperty("autocomplete","off");
		window.addEvent("click",function(ev) {
			if (!this._checkFocus(ev.target)) {
				this.fireEvent("end",this);
			}
		}.bind(this));
	},
	_mergeVocabulary: function(vocabulary, vocabularyToInclude) {
		var merged = vocabulary.combine(vocabularyToInclude).sort();
		return merged;
	},
	_namespaceParser: function(nameSpaceString,caretPosition,namespaceDelimiters) {
		if (nameSpaceString==undefined) { nameSpaceString=this.getSourceValue(); }
			var namespace = null;
			if (typeOf(caretPosition)!="number") {
				caretPosition=this.getSourceCaretPosition();
			}
			if (typeOf(namespaceDelimiters)!="array") {
				namespaceDelimiters=this.options.namespaceDelimiters;
			}
			var endPosition = caretPosition;
			var position=endPosition-1;
			var test = true;
			var previousChar = "";
			while(position >= 0 && test) {
				var c = nameSpaceString.substring(position,position+1);
				if (namespaceDelimiters.contains(c)) { 
					test = false;
				}
				else {
					if (previousChar=="" && c=="") {
						test = false;
						position = position+1;
					}
					else {
						previousChar = c;
						position = position-1;
					}
				}
			}
			var namespaceFlat = nameSpaceString.substring(position+1,endPosition).trim();
			if (namespaceFlat.length > 0 && namespaceFlat != ".") {
				namespace = namespaceFlat.split(".");
				if (namespace[namespace.length-1] == "") namespace[namespace.length-1] = "/"; 
			}
			else if (namespaceFlat.length == 1 && namespaceFlat == ".") {
				namespace = ["/"];
			}
			else if (namespaceFlat.length == 0 && namespaceFlat == "") {
				namespace = ["/"];
			}
			return namespace;
	},
	_setItemSelected: function(item, executeScroll) {
		if (item!=null) {
			var oldItem = this.getItemSelected();
			if (oldItem!=null) { oldItem.removeClass(this.options.css.itemSelected); }
			item.addClass(this.options.css.itemSelected);
			this.fireEvent("selectItem",item);
			if (executeScroll != false) {
				this.scrollToItem(item);
			}
		}
	},
	_setSourceCaretPosition: function() {
		this.options.source.store("MooContentAssist-CaretPosition",this.options.source.getCaretPosition());
	},
	_useItemSelected: function() {
		var text = this.getItemSelected();
		var w = this.getAssistWindow();
		if (text!=null && w!=null) {
			text = text.retrieve("value");
			var textarea = this.options.source;
			var scrollTop = textarea.scrollTop;
			var position = this.getSourceCaretPosition();
			var namespace = this.getNameSpace().getLast();
			if (namespace=="/") {
				completedText=text;
			}
			else {
				completedText = text.substring(namespace.length,text.length);
			}
			var adjustCaseText = text.substring(0,text.length-completedText.length);
			var textbefore = textarea.get("value").substring(0, position);
			textbefore = textbefore.substring(0,textbefore.length-adjustCaseText.length)+adjustCaseText;
			var textafter = textarea.get("value").substring(position);
			textarea.set("value", textbefore + completedText + textafter);
			textarea.setCaretPosition(textbefore.length + completedText.length);
			textarea.scrollTop = scrollTop;
			this.fireEvent("useItem",text);
			this.fireEvent("end",this);
		}
	},
	createAssistWindow: function() {
		var w = new Element("div",{
			"class": "MooContentAssist"
		});
		this.options.source.store("MooContentAssist",w);
		var itemsEventsObj = {};
			itemsEventsObj['click:relay(.'+this.options.css.item+')'] = function(ev){ 
				ev.stopPropagation();
				ev.preventDefault();
				this._useItemSelected();
			}.bind(this);
			itemsEventsObj['mouseover:relay(.'+this.options.css.item+')'] = function(ev){ 
				ev.stopPropagation();
				ev.preventDefault();
				this._setItemSelected(ev.target,false);
			}.bind(this);
		w.addEvents(itemsEventsObj);
		var sourceEl = this.options.source;
		var sourceElPosition=sourceEl.getPosition(); 
		var sourceElSize = sourceEl.getComputedSize();
		var sourceElScroll = sourceEl.getScrollTop();
		w.inject(this.options.source,"after");
		var top = sourceElPosition.y+sourceElSize.height+this.options.windowPadding.y;
		var left= sourceElPosition.x+this.options.windowPadding.x;
		w.setStyles({
			"overflow": "auto",
			"width": sourceElSize.totalWidth,
			"left": left,
			"top": top
		});	
		return w;
	},
	end: function() {
		var mca = this.getAssistWindow();
		if (mca != null) {
			mca.destroy();
			this.options.source.store("MooContentAssist",null);
		}
	},
	getAssistWindow: function() {
		return this.options.source.retrieve("MooContentAssist");
	},
	getItemSelected: function() {
		var w = this.getAssistWindow();
		var item = null;
		if (w!=null) {
			item = w.getElement("."+this.options.css.itemSelected);
		}
		return item;
	},
	getNameSpace: function(string) { 
		var namespace = [];
		namespace = this._namespaceParser(string);
		return namespace;
	},
	getRenderedWord: function(word) {
		return this.options.vocabularyManager_Render.call(this,word);
	},
	getSourceCaretPosition: function() {
		var pos = this.options.source.retrieve("MooContentAssist-CaretPosition");
		if (pos == null) {
			pos = this.options.source.getCaretPosition();
		}
		return pos;
	},
	getSourceValue: function() { 
		return this.options.source.get("value"); 
	},
	getVocabulary: function(namespace) {
		var extractedVocabulary = this.options.vocabularyManager_GetVocabulary.call(this,namespace);
		return extractedVocabulary;
	},
	hide: function() {
		if(this.getAssistWindow()!=null) this.getAssistWindow().dissolve();
		this.fireEvent("hide");
	},
	initialize: function(options) {
		this.setOptions(options);
		this.options.source.store("MooContentAssist",null);
		this._eventManager();
		this.oldNamespace=false;
	},
	scrollToItem: function(item) {
		var w = this.getAssistWindow();
		var animationScroller = w.retrieve("MooContentAssist-AnimationScroller");
		if (animationScroller == null) {
			assistWindowScroller = new Fx.Scroll(w,{
                duration: this.options.animationDuration,
                offset: {"x": 0, "y": w.getStyle('padding-top').toInt()*-1}
            });
            w.store("MooContentAssist-AnimationScroller",animationScroller);
		}
		//item height
        var i = item.getComputedSize({"styles": ["margin","padding","border"]}).totalHeight;
        //box height
        var f = (w.getComputedSize({"styles": ["padding"]}).totalHeight/i).toInt();
        //children
        var children = w.getElements("."+this.options.css.item);
        //current item
        var c = children.indexOf(item);
        //index
        var indexToScrollTo = ((c/f).toInt()) * f; 
		//calculate the current "frame"
		if (c > (f/2).toInt()) {
			indexToScrollTo = c - (f/2).toInt(); 
		}
		//scroll to item at that index
        assistWindowScroller.toElement(children[indexToScrollTo]);
	},
	selectItemDown: function() {
		var currentItem = this.getItemSelected();
		var prevItem = null;
		if (currentItem!=null) {
			prevItem = currentItem.getNext("."+this.options.css.item);
		}
		else {
			prevItem = this.getAssistWindow().getFirst("."+this.options.css.item);
		}
		if (prevItem != null) { this._setItemSelected(prevItem); }
		else { this._setItemSelected(this.getAssistWindow().getFirst("."+this.options.css.item)); }	
	},
	selectItemUp: function() {
		var currentItem = this.getItemSelected();
		var prevItem = null;
		if (currentItem!=null) {
			prevItem = currentItem.getPrevious("."+this.options.css.item);
		}
		else {
			prevItem = this.getAssistWindow().getLast("."+this.options.css.item);
		}
		if (prevItem != null) { this._setItemSelected(prevItem); }
		else { this._setItemSelected(this.getAssistWindow().getLast()); }
	},
	setAggressiveAssist: function(aggressiveStatus) {
		if (typeOf(aggressiveStatus)=="boolean"){
			this.options.aggressiveAssist=aggressiveStatus;
		}
	},
	setAssistWindowContent: function(vocabulary) {
		var w = this.getAssistWindow();
		vocabulary = Array.from(vocabulary);
		for (var i=0;i<vocabulary.length;i++) {
			var currentWord = vocabulary[i];
			currentWord.inject(w);
		}
		this.setFrameSize();
		this.selectItemDown();
	},
	setFrameSize: function(size) {
		if(typeOf(size) != "number") { size = this.options.frameSize; }
		var selector = "."+this.options.css.item;
		var w = this.getAssistWindow();
		var children = w.getElements(selector);
		var childrenLength = children.length > 0 ? children.length : 1;
		if (childrenLength<size) { size = childrenLength;}
		var exampleItem = w.getElement(selector);
		if (exampleItem==null) exampleItem = w.getElement("."+this.options.css.messageItem);
		if (exampleItem!= null) {
			w.setStyle("height",(exampleItem.getComputedSize({
				"styles": ["padding","margin","border"]
			}).totalHeight * size) + "px"); 
		}
	},
	show: function() {
		if(this.getAssistWindow()!=null) this.getAssistWindow().reveal();
		this.getAssistWindow().setStyle("opacity",1);
		this.fireEvent("show");
	},
	start: function() {
		var mca = this.getAssistWindow();
		if (mca!=null) {
			mca.empty();
		}
		var value = this.getSourceValue();
		var namespace = this.getNameSpace(value);
		var vocabulary = null;
		if (namespace == this.oldNamespace) {
			vocabulary = this.oldVocabulary;
		}
		else {
			vocabulary = this.getVocabulary(namespace);
			this.oldVocabulary = vocabulary;
		}
		if (this.options.vocabularyDiscoverer) {
			var userVocabulary = this._discoverUserVocabulary(namespace);
			vocabulary = this._mergeVocabulary(vocabulary,userVocabulary);
		}
		if (vocabulary.length > 0) {
			var renderedVocabulary = [];
			for (var i = 0;i<vocabulary.length;i++) {
				var word = vocabulary[i];
				renderedVocabulary.push(this.getRenderedWord(word));
			}
			if (mca == null) {
				mca = this.createAssistWindow();
			}
			this.setAssistWindowContent(renderedVocabulary);
		}
		else {
			if (!this.options.aggressiveAssist || (this.options.aggressiveAssist && namespace.length>1)) {
				var messageEl = this._createMessage(this.options.labels.nothingFound);
				if (mca == null) {
					mca = this.createAssistWindow();
				}
				this.setAssistWindowContent(messageEl);
			}
			else {
				this.end();
			}
		}
	}
};
var MooContentAssist = new Class(mca);
