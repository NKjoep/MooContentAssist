var namespaceString = "key1 key2_ key3\nkey4()key5?key6[key7]";
	var GlobalNamespaceDelimiters = [" ","\n","\t","\"",",",";","=","(",")","[","]",";","{","}","<",">","+","-",'\\',"!","&","|"];
	var _namespaceParser = function(nameSpaceString,getSourceCaretPosition,namespaceDelimiters) {
		if (typeOf(nameSpaceString)=="string") {
			var namespace = null;
			if (typeOf(getSourceCaretPosition)!="number") {
				getSourceCaretPosition=nameSpaceString.length;
			}
			if (typeOf(namespaceDelimiters)!="array") {
				namespaceDelimiters=GlobalNamespaceDelimiters;
			}
			//var endPosition = this.getSourceCaretPosition();
			var endPosition = getSourceCaretPosition;
			var position=endPosition-1;
			var test = true;
			var previousChar = "";
			while(position >= 0 && test) {
				var c = nameSpaceString.substring(position,position+1);
				if ((namespaceDelimiters.contains(c))) { 
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
		}
		else {
			return ["/"]
		}
	};
