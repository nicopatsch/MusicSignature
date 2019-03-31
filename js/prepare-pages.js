require('./MusicXMLReader');
require('./script');
require('./utils');
require('../music-info');

const fs = require('fs');

var DomParser = require('dom-parser');
const parseXml = require('@rgrove/parse-xml');


fs.writeFile("./output/test_file.txt", "test", function(err) {
    if(err) {
    	console.log("nooooope");
        return console.log(err);
    }

    console.log("The file was saved!");
}); 



main();



function main() {
	var songList = musicList.genres[0].titleList;

	for(var i = 1; i < songList.length ; i++) {
		var song = songList[i];
		loadFile(song);
		console.log(global.musicJson);

		fs.writeFile("./output/"+song.filename+".html", "test content", function(err) {
		    if(err) {
		    	console.log("nooooope");
		        return console.log(err);
		    }

		    console.log("The file was saved!");
		});

	}

}


function cleanXMLContent(fileContent) {
    var parser = new DomParser();

	var dom = parser.parseFromString(fileContent, "text/xml");


	// This will delete all the unnecesary line breaks
    var regex = /(\r|\n|\r\n) */g; 
    fileContent = fileContent.replace(regex, "");

	var parsedXML = parseXml(fileContent);
    
    return parsedXML;
}


function loadFile(song) {
	var filepath = "./music-parts/classic/"+song.filename+".xml";

	var XMLFileContent;
	fs.readFile( filepath, function (err, data) {
		if (err) {
			throw err; 
	  	}
	  	XMLFileContent = data.toString();

	  	global.fullMusicJson = cleanXMLContent(XMLFileContent);
	  	makeMusicJSON(song.songName, song.artist);
	})

}















