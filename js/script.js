var nbNotesInRep = 1;
var spaceBetweenNotes = 0;
var squaresAreColored = true;
var fullSquare = true;
var realDuration = true;
var maxNbParts = 0;

var timers = { "nbRep": 0, "createRectangle": 0, "createWrapperSquare": 0, "printSquare": 0 };



function loadParametersFromHTML() {
	nbNotesInRep = $("#nbNotesInRep").val();
    maxNbParts = $("#maxNbParts").val();

    if(document.getElementById('squaresAreColored')) 
    	squaresAreColored = document.getElementById('squaresAreColored').checked;

    if(document.getElementById('realDuration'))
    	realDuration = document.getElementById('realDuration').checked;

}


function downloadPNGMatrix(svgID, fileName, instrument) {
	var canvas = document.getElementById("canvas");
	
	// Adding the style of the stylesheet inside the <svg> element, 
	// otherwise we won't have any color.
	$.when($.get("css/style.css"))
    .done(function(response) {
    	var svgCSS = '.rectList > rect' + ' { fill: ' + instrumentColor(instrument) + '; }\n';

		$('<style />').text(response + "\n" + svgCSS).prependTo($('#'+svgID));


        var svg = document.querySelector( '#'+svgID);
		var svgData = new XMLSerializer().serializeToString( svg );

		var canvas = document.getElementById( "canvas" );
		var ctx = canvas.getContext( "2d" );

		var img = document.createElement( "img" );
		img.setAttribute( "src", "data:image/svg+xml;base64," + btoa( svgData ) );

		img.onload = function() {
		    ctx.drawImage( img, 0, 0 );

		    var downloadLink = document.createElement('a');
			downloadLink.href = canvas.toDataURL( "image/png" );
			downloadLink.download = fileName;

			document.body.appendChild(downloadLink);
			downloadLink.click();
			document.body.removeChild(downloadLink);
		};
    });
}


function drawNextMatrix(partId, nbPartsToDisplay) {
	timers.nbRep = 0;
	timers.createRectangle = 0;
	timers.createWrapperSquare = 0;
	timers.printSquare = 0;

	if(partId < nbPartsToDisplay) {
		var part = musicJson.parts[partId];
		var instrumentName = part.instrumentName;

		createNewBox(partId, instrumentName);
    	createRectangles(part, partId);

    	setTimeout(function() {
			console.log(timers);
    		drawNextMatrix(partId + 1, nbPartsToDisplay)
    	}, 1);
	}
}


function displayMatrixXML() {
	loadParametersFromHTML();

    //Clean current HTML
    $('#matrixRowContainer').empty();
    $('#matrixRowContainer').html(function(){return this.innerHTML});

    $('#song-name').text(musicJson.songName);
    $('#artist').text("– "+musicJson.artist);


    var nbPartsToDisplay;
    if(maxNbParts) nbPartsToDisplay = Math.min(maxNbParts, musicJson.parts.length);
    else nbPartsToDisplay = musicJson.parts.length;
	
	drawNextMatrix(0, nbPartsToDisplay);

    // If we need to, we add an empty column 
    // (so that the middle vertical line goes all the way down the screen)
    if(nbPartsToDisplay > 1 && nbPartsToDisplay%2==1) {

    	var emptyRect = $('<div></div>').addClass('col-5 content-col empty-col');

    	var rowId = 'row'+(nbPartsToDisplay-1)/2;
    	$('#'+rowId).append(emptyRect);
    }
}


function printSquare(x, y, width, height, color) {
	//TODO DELETE COLOR
	var newID = Math.round((spaceBetweenNotes+1)*x-width/2).toString() + "-" + Math.round((spaceBetweenNotes+1)*y-height/2).toString();
	var newSquare;
	alreadyExistingSquare = $("#" + newID);
	if(alreadyExistingSquare.length==0) {
		//newSquare = '<rect id="' + newID + '" class="noterect" x="' + Math.round((spaceBetweenNotes+1)*x-width/2) + '" y="' + Math.round((spaceBetweenNotes+1)*y-height/2) + '" width="' + width + '" height="' + height + '"></rect>';
		newSquare = $('<rect></rect>').attr({
			"id": newID,
			"x": Math.round((spaceBetweenNotes+1)*x-width/2),
			"y": Math.round((spaceBetweenNotes+1)*y-height/2),
			"width": width,
			"height": height
		});
	}
	rectList.append(newSquare);
}


function createWrapperSquare(note1start, note1end, note2start, note2end, side, partID) {
	

	// TODO :Currently, when hovering over a wrapper, the code doesn't detect all the other identical
	// series in the music. I need to find a way to make the code link all the identical repetitions 
	// to each other at some point in the algorithm.



	if(note1start.position == note2start.position && note1end.position == note2end.position) return;

	var width = Math.round(Math.abs(note1end.timeCode - note1start.timeCode));
	var height = Math.round(Math.abs(note2end.timeCode - note2start.timeCode));

	var x = Math.round(note1start.timeCode + note1end.timeCode)/2-width/2;
	var y = Math.round(note2start.timeCode + note2end.timeCode)/2-height/2;
	
	var newID = partID.toString() + "-" + x.toString() + "-" + y.toString() + "-" + width.toString() + "-" + height.toString();
	alreadyExistingSquare = $("#wrapper-" + newID);
	//if(alreadyExistingSquare.length!=0) return;	
	
	var classHorizontal = partID.toString() + "-" + y.toString() + "-" + width.toString();
	var classVertical = partID.toString() + "-" + x.toString() + "-" + height.toString();

	var newWrapper = makeSVG('rect', {
		"id": "wrapper-"+newID,
		"x": x,
		"y": y,
		"width": width,
		"height": height,
		"class": classVertical + " " + classHorizontal + " reprect"
	});
	var gElement = document.getElementById('drawingBox'+partID);
	gElement.appendChild(newWrapper);


	var verticalID = "vertical-wrapper-"+classVertical;
	if(/*$('#'+verticalID)*/true) { // condition to be remade
		var newVerticalWrapper = makeSVG('rect', {
			"id": verticalID,
			"x": x,
			"y": 0,
			"width": width,
			"height": side,
			"class": classVertical + " column"
		});

		gElement.prepend(newVerticalWrapper);
	}

	var horizontalID = "horizontal-wrapper-"+classHorizontal;
	if(/*$('#'+horisontalID)*/true) { // condition to be remade
		var newHorizontalWrapper = makeSVG('rect', {
			"id": horizontalID,
			"x": 0,
			"y": y,
			"width": side,
			"height": height,
			"class": classHorizontal + " row"
		});

		gElement.prepend(newHorizontalWrapper);
	}

	
	$(newWrapper).mouseenter(function() {
		
		$("#"+verticalID).addClass("hover");
		$("#"+horizontalID).addClass("hover");

		$("."+classVertical + ".reprect").addClass("hover");
		$("."+classHorizontal + ".reprect").addClass("hover");
	}).mouseout(function(){

		$("#"+verticalID).removeClass("hover");
		$("#"+horizontalID).removeClass("hover");

		$("."+classVertical + ".reprect").removeClass("hover");
		$("."+classHorizontal + ".reprect").removeClass("hover");
	});



}



function instrumentType(instrumentName) {

    var instrument = instrumentList.find(function(inst) {
        return inst.name.toLowerCase() == instrumentName.toLowerCase();
    });

    return instrument == null ? "unknown" : instrument.type;
}

function instrumentColor(instrumentName) {
	return typeColors[instrumentType(instrumentName)];
}



function addInstrumentColorsToCSS() {
	var cssStyle = "";

	Object.keys(typeColors).forEach(function(type, index) {
		
		// Styling the note squares
		cssStyle += '.' + type + ' > .rectList > rect ' + ' { fill: ' + typeColors[type] + '; }\n';
		
		// Styling the note repetition wrappers
		cssStyle += '.' + type + ' rect.column.hover' + ' { fill: ' + typeColors[type] + '; opacity:0.2  }\n';
		cssStyle += '.' + type + ' rect.row.hover' + ' { fill: ' + typeColors[type] + '; opacity:0.2 }\n';
		cssStyle += '.' + type + ' rect.reprect.hover' + ' { fill: ' + typeColors[type] + '; opacity:0.4 }\n';
		

		cssStyle += 'svg.matrixSvg.' + type + ' { border-color: ' + 'black' + '; }\n';
		cssStyle += '.' + type + ' { color: ' + typeColors[type] + '; }\n';
		cssStyle += '\n';
	});


	var styleElement = $('<style></style>').text(cssStyle);
	$("head").append(styleElement);
}

function makeSVG(tag, attrs) {
	// Svg not supported by jQuery
    var el= document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs)
        el.setAttribute(k, attrs[k]);
    return el;
}


function createNewBox(id, instrumentName) {
	var instType = instrumentType(instrumentName);

	// Create the SVG element
	var gElement = makeSVG('g', { 'id': 'rectList'+id, 'class': 'rectList' });
	var svgElement = makeSVG('svg', { 'id': 'drawingBox'+id, 'class':'matrixSvg '+ instType });
	svgElement.appendChild(gElement);
	

	// Instrument name to display below the matrix
	var instrumentNameEl = $('<h3></h3>').text(instrumentName).attr({
		'class': 'instrumentName',
		'id': 'instrumentName' + id,
	});


	// Create the download button for the matrix
	var fileName = musicJson.songName.replace(" ", "_") + "_" + musicJson.artist + "_" + instrumentName + ".png";
	var downloadButton = $('<a></a>').text("Download").attr({
		"svg-id": 'drawingBox'+id,
		"filename": fileName,
		"href": "#",
		"instrument":instrumentName
	}).on("click", function() {
		downloadPNGMatrix(
			$(this).attr("svg-id"), 
			$(this).attr("filename"),
			$(this).attr("instrument")
		);
	});

	// Add the button and the intrument name in a div
	var matrixInfo = $("<div></div>").append(instrumentNameEl, downloadButton).addClass('matrix-info ' + instType);

	// The matrix container, in his "column"
	var newRect = $('<div></div>').addClass('col-5 content-col').append(
		$("<div></div>").addClass("matrixContainer " + instType).append(svgElement).append(matrixInfo)
	);

	// An empty column to space on the sides
	var emptyCol = $('<div></div>').addClass('col-1');


	// Depending on the id of the part (even or odd)
	// we put it on the right of the existing row,
	// or create a new row and put it on the left
	var rowId;
	if(id%2==0) {
		rowId = 'row'+id/2;
		var newRow = $("<div></div>").attr({ "id": rowId }).addClass("row content-row");
		
		newRow.append(emptyCol, newRect);

		$("#matrixRowContainer").append(newRow);

	} 
	else {
		rowId = 'row'+(id-1)/2;
		$('#'+rowId).append(newRect, emptyCol);
	}
	
}


function compareNotes(note1, note2) {
	return note1.freq == note2.freq && note1.duration == note2.duration && note1.freq != 0;
}


function createRectangle(note1, note2) {

	var size1 = realDuration ? note1.duration : 1;
	var size2 = realDuration ? note2.duration : 1;

	var position1 = realDuration ? note1.timeCode : note1.position;
	var position2 = realDuration ? note2.timeCode : note2.position;

	var identical = false;
	if(note1.isRest || note2.isRest) return;

	if(note1.isUnpitched || note2.isUnpitched) {
		var t0 = performance.now();
		printSquare(position1, position2, size1, size2, "black");
		printSquare(position2, position1, size2, size1, "black");
		var t1 = performance.now();
	    timers.printSquare += (t1-t0);
	}

	else {
		if(compareNotes(note1, note2)) {
			identical = true;
			var color = squaresAreColored ? colorify(note1.freq-minFreq, maxFreq-minFreq) : "black";
			var t0 = performance.now();
			printSquare(position1, position2, size1, size2, color);
			printSquare(position2, position1, size2, size1, color);
			var t1 = performance.now();
	    	timers.printSquare += (t1-t0);
		}
	}

	return identical;
}



function nbRep(jstart, istart, part) {
	var nbChecked = 0;
	for(var j = jstart; j < part.noteIndices.length; j++) {
		for(var i = istart; i < part.noteIndices.length; i++) {
			if(parseInt(j)+parseInt(i) >= part.noteIndices.length) return nbChecked;

	    	//Getting the corresponding notes
    		indexNote1 = part.noteIndices[parseInt(j)+parseInt(i)];
    		indexNote2 = part.noteIndices[i];

    		note1 = part.measures[indexNote1.measure].notes[indexNote1.note];
    		note2 = part.measures[indexNote2.measure].notes[indexNote2.note];


    		if(compareNotes(note1, note2)) nbChecked++;
    		else return nbChecked;

    	}
    }
    return nbChecked;
}


function createRectangles(part, id) {
    loadParametersFromHTML();

    //Empty current rectangle list
    rectList = $("#rectList"+id.toString());

    rectList.empty();
    rectList.html(function(){ return this.innerHTML });


    maxFreq = part.maxFreq;
    minFreq = part.minFreq;
    //console.log('minFreq: ', minFreq, ', maxFreq: ', maxFreq);


    // Initializing note1 and note2 with first note.
    indexNote0 = part.noteIndices[0];
    var note1 = part.measures[indexNote0.measure].notes[indexNote0.note];
	var note2 = part.measures[indexNote0.measure].notes[indexNote0.note];

	var note1temp, note2temp;

    var indexNote1, indexNote2;
    //var indexNote1 = part.noteIndices[0];
    var currentlyInRep = false;
    var repLength;

    var totalDuration = 0;

	// Use this if you want to limit the number of notes
    var nbNotesToProcess = Math.min(part.noteIndices.length, 100); 
    //var nbNotesToProcess = part.noteIndices.length;
    
    var lastNoteIndex = part.noteIndices[part.noteIndices.length - 1];
    var lastNote = part.measures[lastNoteIndex.measure].notes[lastNoteIndex.note];
    
    var maxIndex = realDuration ? lastNote.timeCode + lastNote.duration : nbNotesToProcess;




    for(var j = 0; j < nbNotesToProcess; j++) {
    	totalDuration = Math.max(totalDuration, note2.timeCode);
    	for(var i = 0; i< nbNotesToProcess - j; i++) {
    		//Getting the corresponding notes
    		indexNote1 = part.noteIndices[parseInt(j)+parseInt(i)];
    		note1 = part.measures[indexNote1.measure].notes[indexNote1.note];
    		indexNote2 = part.noteIndices[i];
    		note2 = part.measures[indexNote2.measure].notes[indexNote2.note];

    		var t0 = performance.now();
    		repLength = nbRep(j, i, part);
    		var t1 = performance.now();
		    timers.nbRep += (t1-t0);


    		if(repLength >= nbNotesInRep) {
    			for(var n = 0; n < repLength; n++) {
  
		    		//Getting the corresponding notes
		    		indexNote1 = part.noteIndices[parseInt(j)+parseInt(i)+n];
		    		note1temp = part.measures[indexNote1.measure].notes[indexNote1.note];
		    		indexNote2 = part.noteIndices[i+n];
		    		note2temp = part.measures[indexNote2.measure].notes[indexNote2.note];

		    		var t0 = performance.now();
		    		createRectangle(note1temp, note2temp);
		    		var t1 = performance.now();
		    		timers.createRectangle += (t1-t0);


		    	}


		    	i+=repLength;
		    	//i = note2.position + repLength;

			    //createRectangle(note1, note2);
			    var t0 = performance.now();
			    createWrapperSquare(note1, note1temp, note2, note2temp, maxIndex, id);
			    createWrapperSquare(note2, note2temp, note1, note1temp, maxIndex, id);
	    		var t1 = performance.now();
	    		timers.createWrapperSquare += (t1-t0);
		    }

    	}
    }

    //console.log(totalDuration);


    jQuery("#drawingBox"+id.toString()).attr("viewBox", "0 0 " + ((spaceBetweenNotes+1)*maxIndex).toString() + " " + ((spaceBetweenNotes+1)*maxIndex).toString());

    // Refreshing HTML element so that new rectangles appear
    rectList.html(function(){return this.innerHTML});
}



function createMusicElement(songObject, genreObject) {
	var musicLi = $("<li></li>");

	if(songObject.hasOwnProperty("year")) {
		musicLi.append(songObject.year).addClass("year-element");
	}

	else {

		var musicLi = $("<li></li>");

		var musicFilePath = "./music-parts/" + genreObject.name + "/" + songObject.filename + ".xml";
		var musicA = $("<a></a>").attr({
	    	"tabindex" : "-1",
	   		"href" : "#",
	   		"filePath" : musicFilePath,
	   		"songName" : songObject.name,
	   		"artist" : songObject.artist
	 	})
		.text(songObject.name + " – " + songObject.artist);

		musicA.on("click", function() {
			loadServerPartFile(
				$(this).attr("songName"), 
				$(this).attr("artist"), 
				$(this).attr("filePath")
			);
		});	

		musicLi.append(musicA);
	}

	return musicLi;
}


function createSelectionMenu() {

	var genreUl = $("#genre-ul");
	var greyLi = false;

	for (genreIndex in musicList.genres) {
		//For each genre, create genre element
		var genreObject = musicList.genres[genreIndex];

		var genreLi = $("<li></li>").addClass("dropdown genre");
		if(greyLi) genreLi.addClass("grey");

		var genreA = $("<a></a>").attr({
		    "tabindex" : "-1",
		    "href" : "#"
		  }).addClass("test genre").text(genreObject.name);

		//console.log(genreObject.titleList)
		var musicUl = $("<ul></ul>").addClass("dropdown-menu");
		for (musicIndex in genreObject.titleList) {
			//For each music in genre, create music element
			musicUl.append(createMusicElement(genreObject.titleList[musicIndex], genreObject));

		}

		//Add everything to genre element

		genreLi.append(genreA, musicUl);
		genreUl.append(genreLi);


		greyLi = !greyLi;
	}
}


global.instrumentType = instrumentType;