
   $('#editorDIV').resizable({
	  alsoResize: ".consoleDIV"
	});

	$('#consoleDIV').resizable({
	  alsoResize: ".editorDIV"
	});

   var editor = ace.edit("editor");
		editor.setOptions({
		autoScrollEditorIntoView: true,
		maxLines: 25,
		minLines: 25
    });

    editor.setTheme("ace/theme/eclipse");
    editor.session.setMode("ace/mode/javascript");
	editor.setShowPrintMargin(false);
    editor.renderer.setScrollMargin(5, 0, 10, 10);

	var console1 = ace.edit("console1");
		console1.setOptions({
		autoScrollEditorIntoView: true,
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

	var data = [
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
	$.each(data,function(i,data){
	   _htmlOptions += "<option val='"+data+"'>"+data+"</option>";
	});

	$("#comboTemas").append(_htmlOptions);

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
		$.getJSON("http://localhost:8080/compiler/api/v1/compiler/scriptList/" + engine ,function(data){
			var _htmlOptions="";
			$.each(data,function(i,data){
			   _htmlOptions += "<option val='"+data+"'>"+data+"</option>";
			});

			$('#comboScripts')[0].options.length = 0;
			$("#comboScripts").append(_htmlOptions);
		});
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
					writeToConsole( "<ERROR> Failed from timeout! (service " + url + ") Server is up? Try again later.");
				  }
				  var pattern1 = /:\d+:/;
				  var pattern2 = /:\s\d+:/;

				  var index = xhr.responseJSON.error_description.match(pattern1);
				  if(index == null){
				      index = xhr.responseJSON.error_description.match(pattern2);
				  }
				  if(index !=null ){
					  index = index.toString().replace(/:/g, '').trim();

					  writeToConsole( "<ERROR> " + xhr.responseJSON.error_description);
					  editor.gotoLine(parseInt(index));
					  editor.setHighlightActiveLine(true);
				  }
				  else {
					  writeToConsole( "<ERROR> " + xhr.responseJSON.error_description);
				  }
			}
		});
	  }
	});

	$.getJSON("http://localhost:8080/compiler/api/v1/compiler/engineList" ,function(data){
		var _htmlOptions = "";
		$.each(data,function(i,data){
		   _htmlOptions += "<option val='"+data+"'>"+data+"</option>";
		});
		$("#comboEngines").append(_htmlOptions)
		$("#comboEngines2").append(_htmlOptions)
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
		
		if(code == "" || code == null || code == undefined) 
			return;
		if(engine == null || engine =="" || engine == undefined){
			bootbox.alert("Select a script engine first!");
			return;
		}
		url = "http://localhost:8080/compiler/api/v1/compiler/compile";

		writeToConsole( "Starting compile request... (Engine:" +  engine + ")");
		var posting = $.jpost( url, { code: code , engine: engine } );
	});

	document.getElementById('btnRun').addEventListener('click', function(e) {
		e.preventDefault();
		engine =  $( "#comboEngines option:selected" ).text();
		code = editor.getValue();
		
		if(code == "" || code == null || code == undefined) 
			return;
		if(engine == null || engine =="" || engine == undefined){
			bootbox.alert("Select a script engine first!");
			return;
		}
		url = "http://localhost:8080/compiler/api/v1/compiler/run";

		writeToConsole( "Running the script... (Engine:" +  engine + ")");

		alert ( params.toString() );
		var posting = $.jpost( url, { code: code , engine: engine , params: [ params ] } );
		//var posting = $.jpost( url, { code: code , engine: engine , params: [{ name: "A" , value: "1"}] } );

	});

	document.getElementById('btnRunCacheScript').addEventListener('click', function(e) {
		e.preventDefault();
		engine =  $( "#comboEngines2 option:selected" ).text();
		scriptName =  $( "#comboScripts option:selected" ).text();

		if(engine == null || engine =="" || engine == undefined){
			bootbox.alert("Select a script engine first!");
			return;
		}
		
		url = "http://localhost:8080/compiler/api/v1/compiler/run";

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
		
		url = "http://localhost:8080/compiler/api/v1/compiler/removeScript";

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
				
				url = "http://localhost:8080/compiler/api/v1/compiler/load";

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

	document.getElementById('btnAddParam').addEventListener('click', function(e) {
	    e.preventDefault();
		var name = document.getElementById('paramName').value;
		var value = document.getElementById('paramValue').value;
		params.push( "{ \"" + name + "\":" + "\"" + value + "\"}" );

		writeToConsole("{ \"" + name + "\":" + "\"" + value + "\"}");
		writeToConsole("Params: [" + params.toString() + " ]" );

	});

