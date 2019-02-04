var rectList;
var nbNotesInRep
var spaceBetweenNotes = 0;
var squaresAreColored = true;
var fullSquare = true;

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


var openFile = function(event) {
    var input = event.target;

    var fileContent;
    var reader = new FileReader();  
    
    if(input.files.length <= 0) return;

    var file = input.files[0];

    reader.onload = function(e) {  
        // get file content 
        fileContent = e.target.result;
        console.log("loaded file");
        displayMatrix(fileContent);
    }
    reader.readAsText(file);

};


function displayMatrix(notesString) {
	nbNotesInRep = $("#nbNotesInRep").val();
	squaresAreColored = document.getElementById('squaresAreColored').checked;
	spaceBetweenNotes = $("#spaceBetweenNotes").val();
	fullSquare = document.getElementById('fullSquare').checked;

	rectList.empty();
	rectList.html(function(){return this.innerHTML});


  	var notesStringArray = notesString.split(" ");
  	var notesArray = [];

  	// Starting at i = 1 to skip name of the instrument
	for (var i = 1; i < notesStringArray.length; i++) {
		var floatFreq = parseFloat(notesStringArray[i]);
		if(!isNaN(floatFreq)) {
			notesArray.push(floatFreq);
		}
	}

	var timer1 = 0, timer2 = 0, timer3 = 0;

	//var maxIndex = Math.min(500, notesArray.length);
	var maxIndex = notesArray.length;
	console.log(maxIndex);
	jQuery("#drawingBox").attr("viewBox", "0 0 " + (spaceBetweenNotes+1)*maxIndex.toString() + " " + (spaceBetweenNotes+1)*maxIndex.toString());

	// Get min and max, improve this
	maxFreq = Math.max(...notesArray);
	minFreq = Math.min(...notesArray);


	console.log(maxFreq, minFreq);
	var maxJ;
	for (var i = 0; i < maxIndex; i++) {
		maxJ = fullSquare ? maxIndex : i;
		console.log(fullSquare, maxJ);
		for (var j = 0; j < maxJ; j++) {

			if(notesArray[i] == notesArray[j] && notesArray[i]==0.) {
				break;
			}
			var diff = notesArray[i] - notesArray[j];
			var isRep = true;
			var n = 0;
			while(isRep) {
				if(notesArray[i+n] - notesArray[j+n] != diff) {
					isRep = false;
					break;
				}
				n++;
			}
			// for(var n=0; n < nbNotesInRep; n++) {
			// 	if(notesArray[i+n] - notesArray[j+n] != diff) {
			// 		isRep = false;
			// 		break;
			// 	}
			// }	
			if(n>=nbNotesInRep /*&& diff==0*/) {
				for(var c=0; c<n; c++) {
					//console.log(i, j, n);
					var color = squaresAreColored ? colorify(notesArray[i+c]-minFreq, maxFreq-minFreq) : "black";
                    if(i==j) printSquare(notesArray[i+c]-minFreq, i+c, j+c, color, 1);
                    else printSquare(notesArray[i+c]-minFreq, i+c, j+c, color, n);
				}
			}
			//j+=n - 1;

			// if((notesArray[i] == notesArray[j] && notesArray[i]!=0.
			// 	// && notesArray[i+1] == notesArray[j+1] /*&& notesArray[i+1]!=0.*/
			// 	// && notesArray[i+2] == notesArray[j+2] /*&& notesArray[i+2]!=0.*/
			// 	// && notesArray[i+3] == notesArray[j+3] /*&& notesArray[i+3]!=0.*/
			// 	) || i == j) {
				
			// 	var isRep = true;
			// 	for(var n=0; n < nbNotesInRep; n++) {
			// 		if(notesArray[i+n] != notesArray[j+n]) {
			// 			isRep = false;
			// 			break;
			// 		}
			// 	}	
			// 	if(isRep) {
			// 		for(var c=0; c<nbNotesInRep; c++) {
			// 			printSquare(notesArray[i+c]-minFreq, i+c, j+c, maxFreq-minFreq);
			// 		}
			// 	}
			// 	//console.log(notesArray[i]);
			// 	// printSquare(notesArray[i]-minFreq, i, j, maxFreq-minFreq);
			// 	// printSquare(notesArray[i+1]-minFreq, i+1, j+1, maxFreq-minFreq);
			// 	// printSquare(notesArray[i+2]-minFreq, i+2, j+2, maxFreq-minFreq);
			// 	// printSquare(notesArray[i+3]-minFreq, i+3, j+3, maxFreq-minFreq);

			// }
		}
	}

	//console.log(notesArray);
	//console.log(timer1/maxIndex, timer2/maxIndex, timer3/maxIndex);
	
	// Refreshing HTML element so that new rectangles appear
	rectList.html(function(){return this.innerHTML});
}

function printSquare(/*(remove i)i, */x, y, color/*(remove n), n*/) {
	var size = 1;
	var newID = x.toString() + "-" + y.toString();
	var newSquare;
	alreadyExistingSquare = $("#" + newID);
	if(alreadyExistingSquare.length==0) {
		newSquare = '<rect id="' + newID + '" class="wordrect" x="' + Math.round((spaceBetweenNotes+1)*x-size/2) + '" y="' + Math.round((spaceBetweenNotes+1)*y-size/2) + '" width="' + size + '" height="' + size + '" fill="' + color + '"></rect>';
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
	return note1.freq == note2.freq && note1.freq != 0;
}


function createRectangle(note1, note2, indexNote1, indexNote2) {
	//console.log(note1, note2, indexNote1, indexNote2);

	var identical = false;
	if(note1.isRest || note2.isRest) return;

	if(note1.isUnpitched || note2.isUnpitched) {
		console.log("Printing one rectangle...");
		printSquare(indexNote1, indexNote2, "black");
		printSquare(indexNote2, indexNote1, "black");
	}

	else {
		if(compareNotes(note1, note2)) {
			identical = true;
			var color = squaresAreColored ? colorify(note1.freq-minFreq, maxFreq-minFreq) : "black";
			printSquare(indexNote1, indexNote2, color);
			printSquare(indexNote2, indexNote1, color);
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

    for(var j in part.noteIndices) {
    	
    	for(var i = 0; i<part.noteIndices.length - j; i++) {

    		//Getting the corresponding notes
    		indexNote1 = part.noteIndices[parseInt(j)+parseInt(i)];
    		note1 = part.measures[indexNote1.measure].notes[indexNote1.note];
    		indexNote2 = part.noteIndices[i];
    		note2 = part.measures[indexNote2.measure].notes[indexNote2.note];

    		var repLength = nbRep(j, i, part);

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
			    createRectangle(note1, note2, parseInt(j)+parseInt(i), i);
		    }
    	}
    }


    var maxIndex = part.nbOfNotes;
    //var maxIndex = indexNote1;
    jQuery("#drawingBox"+id.toString()).attr("viewBox", "0 0 " + ((spaceBetweenNotes+1)*maxIndex).toString() + " " + ((spaceBetweenNotes+1)*maxIndex).toString());

    // Refreshing HTML element so that new rectangles appear
    rectList.html(function(){return this.innerHTML});
}
