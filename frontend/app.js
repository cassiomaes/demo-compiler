    $('#editor').resizable({
	  alsoResize: ".console-1"
	});



	var editor = ace.edit("editor");
		editor.setOptions({
		autoScrollEditorIntoView: true,
		maxLines: Infinity,
		minLines: 30
    });

	var config = new Object()
	config.serverUrl ="http://localhost:8080";
	config.apiUrl    ="/compiler/api/v1/compiler/";
 	config.serverUP  = false;

    editor.setTheme("ace/theme/eclipse");
    editor.session.setMode("ace/mode/javascript");
	editor.setShowPrintMargin(false);
    editor.renderer.setScrollMargin(5, 0, 10, 10);

	var console1 = ace.edit("console1");
		console1.setOptions({
		autoScrollEditorIntoView: false,
		maxLines: 15,
		minLines: 15,
		readOnly: true
    });

    console1.setTheme("ace/theme/eclipse");
    console1.session.setMode("ace/mode/text");
	console1.setShowPrintMargin(false);
    console1.renderer.setScrollMargin(5, 0, 10, 10);
	console1.renderer.setShowGutter(false);
    console1.setHighlightActiveLine(false);
	console1.renderer.$cursorLayer.element.style.display = "none";

	var params = [];

	var temasData = [
	"ambiance",
	"chaos",
	"cobalt",
	"chaos",
    "chrome",
    "clouds",
	"dawn",
	"eclipse",
    "github",
    "textmate",
    "twilight",
	"tomorrow",
	"xcode",
	"iplastic" ];

	var _htmlOptions = "";
	$.each(temasData,function(i,temasData){
	   _htmlOptions += "<option val='"+temasData+"'>"+temasData+"</option>";
	});

	$("#comboTemas").append(_htmlOptions);

	var typesData = [
	"Integer",
	"String",
	"Script",
	"CachedScript",
	];


	_htmlOptions = "";
	$.each(typesData,function(i,typesData){
	   _htmlOptions += "<option val='"+typesData+"'>"+typesData+"</option>";
	});

	$("#comboTypes").append(_htmlOptions);

	function writeToConsole(msg){
		var d = new Date();
		console.error(d.toLocaleTimeString()+ "," + d.getMilliseconds()  + " > " + msg + "\r\n");
	    console1.insert(d.toLocaleTimeString()+ "," + d.getMilliseconds()  + " > " + msg + "\r\n");
	}

	function saveTextAsFile( textToSave, filename  ){
		var textToWrite = textToSave;
		var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
		var fileNameToSaveAs = filename;

		var downloadLink = document.createElement("a");
		downloadLink.download = fileNameToSaveAs;
		downloadLink.innerHTML = "My Hidden Link";

		window.URL = window.URL || window.webkitURL;

		downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
		downloadLink.onclick = destroyClickedElement;
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);
		downloadLink.click();
	}

	function destroyClickedElement(event){
		document.body.removeChild(event.target);
	}

	function atualizaListaScriptsCache(engine){
		$.getJSON(config.serverUrl + config.apiUrl + "scriptList/" + engine ,function(data){
			var _htmlOptions="";
			$.each(data,function(i,data){
			   _htmlOptions += "<option val='"+data+"'>"+data+"</option>";
			});

			$('#comboScripts')[0].options.length = 0;
			$("#comboScripts").append(_htmlOptions);
		});
	}
	
    function atualizaComboEngines(){
		$.getJSON(config.serverUrl + config.apiUrl + "engineList" ,function(data){
			var _htmlOptions = "";
			$.each(data,function(i,data){
			   _htmlOptions += "<option val='"+data+"'>"+data+"</option>";
			});
			$("#comboEngines").append(_htmlOptions)
			$("#comboEngines2").append(_htmlOptions)
			config.serverUP = true;
            writeToConsole("Server is up! Ready for action =D");
		}).error(function() { 
				$("#comboEngines").empty();
				$("#comboEngines").val(''); 

				$("#comboEngines2").empty();
				$("#comboEngines2").val(''); 
				writeToConsole("Server is down! Nothing to do :(  Maybe try again Later...");
		})

	}

	$.extend({
		jpost: function(url, body) {
		return $.ajax({
			type: 'POST',
			url: url,
			data: JSON.stringify(body),
			contentType: "application/json",
			dataType: 'json',
			timeout: 3000, // sets timeout to 3 seconds
			success: function(xhr) {
					writeToConsole(xhr.msg);
			},
			error: function(xhr, status, error) {
				  if(status === 'timeout'){
					writeToConsole( "<ERROR> Request TIMEOUT in call service (" + url + ") Server is busy. Try again later.");
					config.serverUP = true;
					return;
				  }
				  if(xhr.responseJSON == undefined){					
					writeToConsole( "<ERROR> Failed to call service (" + url + ") Server is up? Url and port is correct?");
					config.serverUP = false;

					return;
				  }
				  var pattern1 = /:\d+:/;
				  var pattern2 = /:\s\d+:/;

				  var index = xhr.responseJSON[0].error_description[0].match(pattern1);
				  if(index == null){
				      index = xhr.responseJSON[0].error_description[0].match(pattern2);
				  }
				  if(index !=null ){
					  index = index.toString().replace(/:/g, '').trim();

					  writeToConsole( "<ERROR> " + xhr.responseJSON[0].error_description[0]);
					  editor.gotoLine(parseInt(index));
					  editor.setHighlightActiveLine(true);
				  }
				  else {
					  writeToConsole( "<ERROR> " + xhr.responseJSON[0].error_description[0]);
				  }
			}
		});
	  }
	});

   	document.getElementById('fileInput').addEventListener('change', function(e) {
        var file = fileInput.files[0];
        var textType = /text.*/;

        if (file.type.match(textType)) {
            var reader = new FileReader();

            reader.onload = function(e) {
                editor.setValue(reader.result);
			    editor.gotoLine(1);
			    editor.setHighlightActiveLine(true);
				editor.focus();
			    writeToConsole("Open file " + file.name);
            }
            reader.readAsText(file);

        } else {
		   writeToConsole( "<ERROR> File " + file.name + " not supported!");
        }
    });

	document.getElementById('comboTemas').addEventListener('change', function(e) {
        e.preventDefault();
		tema =  $( "#comboTemas option:selected" ).text();
		editor.setTheme("ace/theme/" + tema );
		console1.setTheme("ace/theme/" + tema );
	});


	document.getElementById('comboEngines2').addEventListener('change', function(e) {
        e.preventDefault();
		engine =  $( "#comboEngines2 option:selected" ).text();
		atualizaListaScriptsCache(engine);
	});

	document.getElementById('btnClearConsole').addEventListener('click', function(e) {
	    e.preventDefault();
		console1.setValue("")
	});

	document.getElementById('btnCompile').addEventListener('click', function(e) {
		e.preventDefault();
		engine =  $( "#comboEngines option:selected" ).text();
		code = editor.getValue();
				
		if(engine == null || engine =="" || engine == undefined){
			bootbox.alert("Select a script engine first!");
			return;
		}
		if(code == "" || code == null || code == undefined) {
			bootbox.alert("Nothing to compile!");
			return;
		}

		url = config.serverUrl +config.apiUrl + "compile";

		writeToConsole( "Starting compile request... (Engine:" +  engine + ")");
		var posting = $.jpost( url, { code: code , engine: engine } );
	});

	document.getElementById('btnRun').addEventListener('click', function(e) {
		e.preventDefault();
		engine =  $( "#comboEngines option:selected" ).text();
		code = editor.getValue();
		
		if(engine == null || engine =="" || engine == undefined){
			bootbox.alert("Select a script engine first!");
			return;
		}
		if(code == "" || code == null || code == undefined) {
			bootbox.alert("Nothing to Run!");
			return;
		}
		url =config.serverUrl + config.apiUrl + "run";

		writeToConsole( "Running the script... (Engine:" +  engine + ") Params: [" + JSON.stringify(params) + " ]");

		var posting = $.jpost( url, { code: code , engine: engine , params: params } );

	});

	document.getElementById('btnRunCacheScript').addEventListener('click', function(e) {
		e.preventDefault();
		engine =  $( "#comboEngines2 option:selected" ).text();
		scriptName =  $( "#comboScripts option:selected" ).text();

		if(engine == null || engine =="" || engine == undefined){
			bootbox.alert("Select a script engine first!");
			return;
		}
		
		url =config.serverUrl + config.apiUrl + "run";

		writeToConsole( "Running Cached Script " + scriptName + " ... (Engine:" +  engine + ")");
		var posting = $.jpost( url, { engine: engine , scriptName: scriptName } );

	});

	document.getElementById('btnDelCacheScript').addEventListener('click', function(e) {
		e.preventDefault();
		engine =  $( "#comboEngines2 option:selected" ).text();
		scriptName =  $( "#comboScripts option:selected" ).text();

		if(engine == null || engine =="" || engine == undefined){
			bootbox.alert("Select a script engine first!");
			return;
		}
		
		url = config.serverUrl + config.apiUrl + "removeScript";

		writeToConsole( "Running the script... (Engine:" +  engine + ")");
		var posting = $.jpost( url, { engine: engine , scriptName: scriptName } );
		posting.done(function() { atualizaListaScriptsCache(engine);  });

	});

	document.getElementById('btnUpload').addEventListener('click', function(e) {
	    e.preventDefault();
		engine =  $( "#comboEngines option:selected" ).text();
		code = editor.getValue();
		
		if(code == "" || code == null || code == undefined) 
			return;
		if(engine == null || engine =="" || engine == undefined){
			bootbox.alert("Select a script engine first!");
			return;
		}
		bootbox.prompt("Upload to Cache... (Engine:" +  engine + ")",  function(scriptName){
			if(scriptName != null){
				
				url = config.serverUrl + config.apiUrl + "load";

				writeToConsole( "Uploading the script to Dynamic Cache (Engine:" +  engine + ")");
				var posting = $.jpost( url, { code: code , scriptName: scriptName, engine: engine } );
				posting.done(function() { atualizaListaScriptsCache(engine);  });

			}
		});
	});

	document.getElementById('btnSave').addEventListener('click', function(e) {
	    e.preventDefault();
		if(editor.getValue() != ""){
			bootbox.prompt("Save As...", function(scriptName){
			  if(scriptName != null){
				saveTextAsFile( editor.getValue() , scriptName );
				writeToConsole( "Save file " + scriptName + ".");
			  }
			});
		}
	});

	document.getElementById('btnParams').addEventListener('click', function(e) {
	    e.preventDefault();
	});

	document.getElementById('comboTypes').addEventListener('change', function(e) {
	    e.preventDefault();
		document.getElementById('paramValue').value="";
	});

	document.getElementById('btnUpdateServer').addEventListener('click', function(e) {
	    e.preventDefault();
		config.serverUrl = document.getElementById('serverUrl').value;
		atualizaComboEngines();
		writeToConsole( "Server changed to " + config.serverUrl);
	});

	document.getElementById('btnAddParam').addEventListener('click', function(e) {
	    e.preventDefault();
		var obj = new Object();
		obj.name  = document.getElementById('paramName').value;
  	  	obj.value = document.getElementById('paramValue').value; 		
        obj.type  = $( "#comboTypes option:selected" ).text();
		
		var find = false;
	
		params.forEach(function(item) {
		  if(item.name == obj.name){
		     item.value = obj.value;
			 item.type  = obj.type;
 			 find=true;					  
		  }             
		});
			
		if(find){
	     	 writeToConsole( "Alter parameter:" + JSON.stringify(obj) );
		}
		else{
			params.push(obj);
			writeToConsole( "Add parameter:" + JSON.stringify(obj) );
		}

		writeToConsole("Params: [" + JSON.stringify(params) + " ]" );		
	});
   
	$(".ui-wrapper").css("overflow", "auto");
    $(".ui-wrapper").css("height", "auto");
    $(".ui-wrapper").css("width", "auto");

	 atualizaComboEngines();
	
