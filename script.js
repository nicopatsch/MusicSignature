var rectList;
var nbNotesInRep
var spaceBetweenNotes = 0;
var squaresAreColored = true;
var fullSquare = true;
var realDuration;


$( document ).ready(function() {
    //rectList = $("#rectList");
});


function displayMatrixXML() {
    console.log(musicXML);
    //fullMusicJson = parseXml(musicXML);
    console.log(fullMusicJson);

    musicJson = reduceJsonFile();
    console.log(musicJson);
    maxNbParts = $("#maxNbParts").val();


    //Clean current HTML
    $('#matrixRowContainer').empty();
    $('#matrixRowContainer').html(function(){return this.innerHTML});

    $('#songName').text(musicJson.songName + " – " + musicJson.artist);

    for(var partId = 0; partId < Math.min(maxNbParts, musicJson.parts.length); partId++) {
    	part = musicJson.parts[partId];

    	var instrumentName = part.instrumentName;
    	createNewBox(partId, instrumentName);
    	createRectangles(part, partId);
    }
}


function printSquare(x, y, width, height, color) {
	//var size = 1;
	var newID = x.toString() + "-" + y.toString();
	var newSquare;
	alreadyExistingSquare = $("#" + newID);
	if(alreadyExistingSquare.length==0) {
		newSquare = '<rect id="' + newID + '" class="wordrect" x="' + Math.round((spaceBetweenNotes+1)*x-width/2) + '" y="' + Math.round((spaceBetweenNotes+1)*y-height/2) + '" width="' + width + '" height="' + height + '" fill="' + color + '"></rect>';
		//newSquare = "<circle id=\"" + newID + "\" class=\"wordrect\" cx=\"" + Math.round(3*x-size/2) + "\" cy=\"" + Math.round(3*y-size/2) + "\" r=\"" + size + "\" fill=\"" + color + "\" fill-opacity=\"0.1\"></circle>";
	}
	rectList.append(newSquare);
}



function createNewBox(id, instrumentName) {
	var height = 300;
	var width = 300;

	var svgString = '<svg id="drawingBox'+id+'" class="matrixSvg"><g><g class="matrixHighlights"></g><g id="rectList'+id+'"></g></g></svg>';
	var instrumentText = '<h3 class="instrumentName" id="instrumentName' + id + '">' + instrumentName + '</h3>';

	var rowId;

	var newRect;

	if(id%2==0) {
		rowId = 'row'+id/2;

		var newRow = '<div class="row blankRow"></div>';
		newRow += '<div id="' + rowId + '" class="row"></div>';
		$("#matrixRowContainer").append(newRow);

		newRect = '<div class="col-5"><div class="matrixContainer">' + svgString + '</div>' + instrumentName + '</div>';
		newRect += '<div class="col-1 divide"></div>';
	} 
	else {
		rowId = 'row'+(id-1)/2;

		newRect = '<div class="col-5"><div class="matrixContainer">' + svgString + '</div>' + instrumentName + '</div>';
	}
	

	$('#'+rowId).append(newRect);
}


function compareNotes(note1, note2) {
	return note1.freq == note2.freq && note1.duration == note2.duration && note1.freq != 0;
}


function createRectangle(note1, note2, indexNote1, indexNote2) {
	//console.log(note1, note2, indexNote1, indexNote2);

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

 	// for(var meas1 = m1start; meas1 < part.measures.length; meas1++) {
  //   	for(var no1 = n1start; no1 < part.measures[meas1].notes.length; no1++) {
  //   		note1 = part.measures[meas1].notes[no1];
  //   		for(var i = m2start; i < part.measures.length; i++) {
  //   			for(var j = n2start; j < part.measures[meas1+i].notes.length; j++) {
  //   				if(nbChecked >= nbNotesInRep) return true;
  //   				note2 = part.measures[meas1+i].notes[no1+j];
  //   				if(compareNotes(note1, note2)) nbChecked++;
  //   				else return false;
  //   			}
  //   		}
  //   	}
  //   }
    return false;
}



function nbRep(jstart, istart, part) {
	var nbChecked = 0;

	for(var j = jstart; j < part.noteIndices.length; j++) {
		for(var i = istart; i < part.noteIndices.length; i++) {

	    	//Getting the corresponding notes
    		indexNote1 = part.noteIndices[parseInt(j)+parseInt(i)];
    		indexNote2 = part.noteIndices[i];

    		if(indexNote2 == null || indexNote1 == null) {
    			console.log(j, i, indexNote1, indexNote2, part.noteIndices);
    		}
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
    console.log(nbNotesInRep);
    squaresAreColored = document.getElementById('squaresAreColored').checked;
    realDuration = document.getElementById('realDuration').checked;
    spaceBetweenNotes = $("#spaceBetweenNotes").val();

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
