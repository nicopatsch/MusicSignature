var rectList;
var nbNotesInRep
var spaceBetweenNotes = 0;
var squaresAreColored = true;
var fullSquare = true;
var realDuration;
var img;

$( document ).ready(function() {
    //rectList = $("#rectList");
    createSelectionMenu();
    addInstrumentColorsToCSS();

	loadServerPartFile("Bohemian Rhapsody", "Queen", "./music-parts/Rock/Queen-Bohemian_Rhapsody_Voice.xml");

	// $("#save-button").click(function() {


	// });
});



function downloadPNGMatrix(svgID, fileName) {
	var canvas = document.getElementById("canvas");
	
	// Adding the style of the stylesheet inside the <svg> element, 
	// otherwise we won't have any color.
	$.when($.get("style.css"))
    .done(function(response) {
        $('<style />').text(response).prependTo($('#'+svgID));


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




function displayMatrixXML() {
    maxNbParts = $("#maxNbParts").val();

    //Clean current HTML
    $('#matrixRowContainer').empty();
    $('#matrixRowContainer').html(function(){return this.innerHTML});

    $('#songName').text(musicJson.songName);
    $('#artist').text(musicJson.artist);


    var nbPartsToDisplay;
    if(maxNbParts) nbPartsToDisplay = Math.min(maxNbParts, musicJson.parts.length);
    else nbPartsToDisplay = musicJson.parts.length;

    for(var partId = 0; partId < nbPartsToDisplay; partId++) {
    	part = musicJson.parts[partId];

    	var instrumentName = part.instrumentName;
    	
    	var colClass = "";
    	//if(nbPartsToDisplay%2==1 && partId == nbPartsToDisplay-2) colClass='no-border';
    	
    	createNewBox(partId, instrumentName, colClass);
    	createRectangles(part, partId);
    }

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


function createNewBox(id, instrumentName, colClass) {
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
	var downloadButton = $('<a></a>').text("Download").attr({
		"svg-id": 'drawingBox'+id,
		"filename": 'matrix.png',
		"href": "#"
	}).on("click", function() {
		downloadPNGMatrix(
			$(this).attr("svg-id"), 
			$(this).attr("filename")
		);
	});

	// Add the button and the intrument name in a div
	var matrixInfo = $("<div></div>").append(instrumentNameEl, downloadButton).addClass('matrix-info ' + instType);

	// The matrix container, in his "column"
	var newRect = $('<div></div>').addClass('col-5 content-col '+colClass).append(
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


function isThisARep(m1start, m2start, n1start, n2start, part, nbNotesInRep) {
	var nbChecked = 0;
	for(var meas1 = m1start; meas1 < part.measures.length; meas1++) {
    	for(var no1 = n1start; no1 < part.measures[meas1].notes.length; no1++) {
    		for(var meas2 = m2start; meas2 < part.measures.length; meas2++) {
    			for(var no2 = n2start; no2 < part.measures[meas2].notes.length; no2++) {
    				if(nbChecked >= nbNotesInRep) return true;
					note1 = part.measures[meas1].notes[no1];
    				note2 = part.measures[meas2].notes[no2];
    				if(compareNotes(note1, note2)) nbChecked++;
    				else return false;
    			}
    		}
    	}
    }

    return false;
}



function nbRep(jstart, istart, part) {
	var nbChecked = 0;

	for(var j = jstart; j < part.noteIndices.length; j++) {
		for(var i = istart; i < part.noteIndices.length; i++) {

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
    nbNotesInRep = $("#nbNotesInRep").val();
    squaresAreColored = document.getElementById('squaresAreColored').checked;
    realDuration = document.getElementById('realDuration').checked;

    //Empty current rectangle list
    rectList = $("#rectList"+id.toString());

    rectList.empty();
    rectList.html(function(){ return this.innerHTML });


    maxFreq = part.maxFreq;
    minFreq = part.minFreq;
    console.log('minFreq: ', minFreq, ', maxFreq: ', maxFreq);



    var note1, note2;
    var indexNote1, indexNote2;
    //var indexNote1 = part.noteIndices[0];
    var currentlyInRep = false;
    var repLength;

    var note1X = 0, note2X = 0;
    var totalDuration = 0;

    for(var j in part.noteIndices) {
    	totalDuration = Math.max(totalDuration, note2X);
    	note1X = parseInt(j);
    	note2X = 0;
    	for(var i = 0; i<part.noteIndices.length - j; i++) {
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

    console.log(totalDuration);


    var maxIndex = realDuration ? totalDuration : part.nbOfNotes;
    //var maxIndex = indexNote1;
    jQuery("#drawingBox"+id.toString()).attr("viewBox", "0 0 " + ((spaceBetweenNotes+1)*maxIndex).toString() + " " + ((spaceBetweenNotes+1)*maxIndex).toString());

    // Refreshing HTML element so that new rectangles appear
    rectList.html(function(){return this.innerHTML});
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

		console.log(genreObject.titleList)
		var musicUl = $("<ul></ul>").addClass("dropdown-menu");
		for (musicIndex in genreObject.titleList) {

			//For each music in genre, create music element
			var songObject = genreObject.titleList[musicIndex];

			var musicLi = $("<li></li>");

			var musicFilePath = "./music-parts/" + genreObject.name + "/" + songObject.filename + ".xml";
			var musicA = $("<a></a>").attr({
		    	"tabindex" : "-1",
		   		"href" : "#",
		   		"filePath" : musicFilePath,
		   		"songName" : songObject.name,
		   		"artist" : songObject.artist
		 	})
			.addClass("test")
			.text(songObject.name + " – " + songObject.artist);

			musicA.on("click", function() {
				loadServerPartFile(
					$(this).attr("songName"), 
					$(this).attr("artist"), 
					$(this).attr("filePath")
				);
			});	

			musicLi.append(musicA);
			musicUl.append(musicLi);

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


$(document).ready(function(){
  $('.dropdown-submenu a.test').hover(function(e){
    $(this).next('ul').toggle();
    e.stopPropagation();
    e.preventDefault();
  },
  function(e) {
  	//Nothing on hover out
  });
});
















