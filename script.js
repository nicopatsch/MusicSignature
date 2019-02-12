var nbNotesInRep = 1;
var spaceBetweenNotes = 0;
var squaresAreColored = true;
var fullSquare = true;
var realDuration = true;
var maxNbParts = 0;

$( document ).ready(function() {
    createSelectionMenu();
    addInstrumentColorsToCSS();

    //var t0 = performance.now();
    loadServerPartFile("Bohemian Rhapsody", "Queen", "./music-parts/rock/80s/Queen-Bohemian_Rhapsody.xml");
	//loadServerPartFile("Bohemian Rhapsody", "Queen", "./music-parts/Pop/Under_Pressure.xml");
	//loadServerPartFile("Should I Stay or Should I Go", "The Clash", "./music-parts/Pop/Should_I_Stay_or_Should_I_Go.xml");
	//var t1 = performance.now();
	//console.log("Timer : " + (t1-t0));


	$('#description-toggler').on('click', function(e) {
		document.getElementById('description-content').style.display = "block";
	})

	$('#description-less').on('click', function(e) {
		document.getElementById('description-content').style.display = "none";
	})

});


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
	$.when($.get("style.css"))
    .done(function(response) {
    	var svgCSS = 'rect' + ' { fill: ' + instrumentColor(instrument) + '; }\n';

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
	if(partId < nbPartsToDisplay) {
		var part = musicJson.parts[partId];
		var instrumentName = part.instrumentName;

		createNewBox(partId, instrumentName);
    	createRectangles(part, partId);
	}
	setTimeout(function() {
    	drawNextMatrix(partId + 1, nbPartsToDisplay)
    }, 1);
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
	var newID = x.toString() + "-" + y.toString();
	var newSquare;
	alreadyExistingSquare = $("#" + newID);
	if(alreadyExistingSquare.length==0) {
		//newSquare = '<rect id="' + newID + '" class="wordrect" x="' + Math.round((spaceBetweenNotes+1)*x-width/2) + '" y="' + Math.round((spaceBetweenNotes+1)*y-height/2) + '" width="' + width + '" height="' + height + '"></rect>';
		newSquare = $('<rect></rect>').attr({
			"id": newID,
			"x": Math.round((spaceBetweenNotes+1)*x-width/2),
			"y": Math.round((spaceBetweenNotes+1)*y-height/2),
			"width": width,
			"height": height
		}).addClass('wordrect');
	}
	rectList.append(newSquare);
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
		cssStyle += '.' + type + ' rect' + ' { fill: ' + typeColors[type] + '; }\n';
		cssStyle += 'svg.matrixSvg.' + type + ' { border-color: ' + /*typeColors[type]*/'black' + '; }\n';
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
	var gElement = makeSVG('g', { 'id': 'rectList'+id });
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


function createRectangle(note1, note2, indexNote1, indexNote2) {

	var size1 = realDuration ? note1.duration : 1;
	var size2 = realDuration ? note2.duration : 1;

	var position1 = realDuration ? note1.timeCode : note1.position;
	var position2 = realDuration ? note2.timeCode : note2.position;

	var identical = false;
	if(note1.isRest || note2.isRest) return;

	if(note1.isUnpitched || note2.isUnpitched) {
		printSquare(position1, position2, size1, size2, "black");
		printSquare(position2, position1, size2, size1, "black");
	}

	else {
		if(compareNotes(note1, note2)) {
			identical = true;
			var color = squaresAreColored ? colorify(note1.freq-minFreq, maxFreq-minFreq) : "black";
			printSquare(position1, position2, size1, size2, color);
			printSquare(position2, position1, size2, size1, color);
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



    var note1, note2;
    var indexNote1, indexNote2;
    //var indexNote1 = part.noteIndices[0];
    var currentlyInRep = false;
    var repLength;

    var note1X = 0, note2X = 0;
    var totalDuration = 0;

	// Use this if you want to limit the number of notes
    //var nbNotesToProcess = Math.min(part.noteIndices.length, 2000); 
    var nbNotesToProcess = part.noteIndices.length;

    for(var j = 0; j < nbNotesToProcess; j++) {
    	totalDuration = Math.max(totalDuration, note2X);
    	note1X = parseInt(j);
    	note2X = 0;
    	for(var i = 0; i< nbNotesToProcess - j; i++) {
    		//Getting the corresponding notes
    		indexNote1 = part.noteIndices[parseInt(j)+parseInt(i)];
    		note1 = part.measures[indexNote1.measure].notes[indexNote1.note];
    		indexNote2 = part.noteIndices[i];
    		note2 = part.measures[indexNote2.measure].notes[indexNote2.note];

    		repLength = nbRep(j, i, part);

    		note1X += note1.duration;
    		note2X += note2.duration;

    		if(repLength >= nbNotesInRep) {
    			// for(var n = 0; n < repLength; n++) {
  
		    	// 	//Getting the corresponding notes
		    	// 	indexNote1 = part.noteIndices[parseInt(j)+parseInt(i)+n];
		    	// 	note1 = part.measures[indexNote1.measure].notes[indexNote1.note];
		    	// 	indexNote2 = part.noteIndices[i+n];
		    	// 	note2 = part.measures[indexNote2.measure].notes[indexNote2.note];

		    	// 	createRectangle(note1, note2, parseInt(j)+parseInt(i)+n, i+n);

		    	// }

			    // j+=n;
			    // i+=n;
			    

			    //createRectangle(note1, note2, parseInt(j)+parseInt(i), i);
			    createRectangle(note1, note2, note1X, note2X);
		    }
    	}
    }

    //console.log(totalDuration);


    var maxIndex = realDuration ? totalDuration : nbNotesToProcess;
    //var maxIndex = indexNote1;
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
		// <li class="dropdown-submenu">
  //         <a class="test" tabindex="-1" href="#">Classic<span class="caret"></span></a>
  //         <ul class="dropdown-menu"></ul>
  //       </li>
	}
}



// $(document).ready(function(){
//   $('.dropdown-submenu a.test').on("click", function(e){
//     $(this).next('ul').toggle();
//     e.stopPropagation();
//     e.preventDefault();
//   });
// });
