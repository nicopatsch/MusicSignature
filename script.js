var rectList;
var nbNotesInRep
var spaceBetweenNotes = 0;
var squaresAreColored = true;
var fullSquare = true;

$( document ).ready(function() {
    console.log( "ready!" );
    //printSquares(20);
    rectList = $("#rectList");
});

// This isn't working but you might want to check it out later...
// Vue.component('note', {
// 	props: ['x', 'y', 'color'],
//   	template: '<rect class="wordrect" x="2" y="2" width="1" height="1" fill="blue"></rect>'
//   	//template: '<rect class="wordrect" x="{{ x }}" y="{{ y }}" width="1" height="1" fill="{{ color }}"></rect>'
// })

// var app = new Vue({
//   el: '#vueCanvas',
//   data: {
//   	noteList: [
// 	  	{ id:0, x: 1, y: 1, color: 'blue' },
// 	  	{ id:1, x: 2, y: 2, color: 'red' },
// 	  	{ id:2, x: 3, y: 3, color: 'green' }
// 	]
//   }
// })


// $("#musicSheetInput")onclick = function () {
//     this.value = null;
// };

// input.onchange = function () {
//     alert(this.value);
// };​


function colorify(i, totalValues) {
    var hue = Math.min(360, Math.floor(360 * i/totalValues));
    return hslToHex(hue, 100, 70);
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
					if(i==j) printSquare(notesArray[i+c]-minFreq, i+c, j+c, maxFreq-minFreq, 1);
					else printSquare(notesArray[i+c]-minFreq, i+c, j+c, maxFreq-minFreq, n);
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

function printSquare(i, x, y, nbSquares, n) {
	//var size = Math.round(n/4);
	var size = 1;

	var color = squaresAreColored ? colorify(i, nbSquares) : "black";
	var newID = x.toString() + "-" + y.toString();
	//console.log(newID);
	alreadyExistingSquare = $("#" + newID);
	if(alreadyExistingSquare.length==0) {
		rectList.append("<rect id=\"" + newID + "\" class=\"wordrect\" x=\"" + Math.round((spaceBetweenNotes+1)*x-size/2) + "\" y=\"" + Math.round((spaceBetweenNotes+1)*y-size/2) + "\" width=\"" + size + "\" height=\"" + size + "\" fill=\"" + color + "\" fill-opacity=\"1\"></rect>");
		//rectList.append("<circle id=\"" + newID + "\" class=\"wordrect\" cx=\"" + Math.round(3*x-size/2) + "\" cy=\"" + Math.round(3*y-size/2) + "\" r=\"" + size + "\" fill=\"" + color + "\" fill-opacity=\"0.1\"></circle>");
	}
	//rectList.append("<rect class=\"wordrect\" x=\"" + 3*x + "\" y=\"" + 3*y + "\" width=\"1\" height=\"1\" fill=\"" + color + "\"></rect>");console.log(color);
	

	// Refreshing HTML element so that new rectangles appear
	//rectList.html(function(){return this.innerHTML});
}


function printSquares(nbSquares) {
	var rectList = $("#rectList");

	//Adding new rectangles
	for (var i = 0; i < nbSquares; i++) {
		//rectList.append("<rect class=\"wordrect\" x=\"" + i + "\" y=\"" + i + "\" width=\"1\" height=\"1\" fill=\"" + colorify(i, nbSquares) + "\"></rect>");
	}

	// Refreshing HTML element so that new rectangles appear
	rectList.html(function(){return this.innerHTML});
	
}