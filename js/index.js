$( document ).ready(function() {
    createSelectionMenu();
    addInstrumentColorsToCSS();

    //loadServerPartFile("Bohemian Rhapsody", "Queen", "./music-parts/rock/80s/Queen-Bohemian_Rhapsody.xml");
	//loadServerPartFile("Bohemian Rhapsody", "Queen", "./music-parts/Pop/Under_Pressure.xml");
	//loadServerPartFile("Should I Stay or Should I Go", "The Clash", "./music-parts/Pop/Should_I_Stay_or_Should_I_Go.xml");
	//loadServerPartFile("Should I", "Rilès", "./music-parts/other/riles_should_i.xml");
	loadServerPartFile("All Blues 4/4", "No artist", "./music-parts/jazz/All_Blues_44.xml");

	// Bind reload button to this song
    $('#update-btn').unbind("click");
    $('#update-btn').on("click", function() {
        loadServerPartFile(songName, artist, filePath);
    });


    displayMatrixXML();

	$('#description-toggler').on('click', function(e) {
		document.getElementById('description-content').style.display = "block";
	});

	$('#description-less').on('click', function(e) {
		document.getElementById('description-content').style.display = "none";
	});

});
