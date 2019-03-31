var nbNotesInRep = 1;
var spaceBetweenNotes = 0;
var squaresAreColored = true;
var fullSquare = true;
var realDuration = true;
var maxNbParts = 0;

var timers = { "nbRep": 0, "createRectangle": 0, "createWrapperSquare": 0, "printSquare": 0 };

$( document ).ready(function() {
    createSelectionMenu();
    addInstrumentColorsToCSS();

    var t0 = performance.now();
    //loadServerPartFile("Bohemian Rhapsody", "Queen", "./music-parts/rock/80s/Queen-Bohemian_Rhapsody.xml");
	//loadServerPartFile("Bohemian Rhapsody", "Queen", "./music-parts/Pop/Under_Pressure.xml");
	//loadServerPartFile("Should I Stay or Should I Go", "The Clash", "./music-parts/Pop/Should_I_Stay_or_Should_I_Go.xml");
	//loadServerPartFile("Should I", "Rilès", "./music-parts/other/riles_should_i.xml");
	loadServerPartFile("All Blues 4/4", "No artist", "./music-parts/jazz/All_Blues_44.xml");

	var t1 = performance.now();
	console.log("Timer : " + (t1-t0));


	$('#description-toggler').on('click', function(e) {
		document.getElementById('description-content').style.display = "block";
	});

	$('#description-less').on('click', function(e) {
		document.getElementById('description-content').style.display = "none";
	});

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
