require('./MusicXMLReader');
require('./script');
require('./utils');
require('../music-info');

const fs = require('fs');

var DomParser = require('dom-parser');
const parseXml = require('@rgrove/parse-xml');
const jsdom = require("jsdom");

var HTMLFileContent;

main();

function main() {

	//Code also a function that copies index.html and puts the scripts necesary for browser-side rendering
	

	// This function will recursively call the preparation of each page one by one
	createPageFromFile(0);

}


function printHTMLToFile(songId, htmlString) {

	var song = musicList[songId];

	fs.writeFile("./output/"+song.filename+".html", htmlString, function(err) {
	    if(err) {
	    	console.log("nooooope");
	        return console.log(err);
	    }

	    console.log(song.name, "--> OK");


		if(songId < musicList.length - 1) {
			createPageFromFile(songId+1);
		}

		else {
			console.log("Every song page has been prepare!");
		}

	});
}



function createPage(songId) {

	var resultingHTML;
	fs.readFile("./template/index.html", function (err, data) {

		if (err) {
			throw err; 
	  	}
	
	  	HTMLFileContent = data.toString();


	  	/*** Preparing everything needed to run jQuery ***/
	  	const { JSDOM } = jsdom;

	    const dom = new JSDOM(HTMLFileContent);
	    const { document } = dom.window;

	    const $ = (require('jquery'))(dom.window);

	    global.document = document;
		global.$ = $;
		global.jQuery = $;


		/*** Preparing the page... ***/
		
		try {
			displayMatrixXML();
		}
		catch(err) {
			console.log(err);
			if(songId < musicList.length - 1) {
				createPageFromFile(songId+1);
			}
			return;
		}
	
		createSelectionMenu();





		/*** Capturing and printing the page ***/
		// Once the page creation is over, we capture it and print it to a file
		resultingHTML = "<!doctype html>\n" + $('html')[0].outerHTML;

		var song = musicList[songId];

		printHTMLToFile(songId, resultingHTML);



		
	});
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



function createPageFromFile(songId) {

	var song = musicList[songId];

	console.log(songId, song.name, song.artist);
	
	var year = song.hasOwnProperty("year") ? "/" + song.year : "";
	var filepath = "./music-parts/"+song.genre+year+"/"+song.filename+".xml";

	var XMLFileContent;
	fs.readFile( filepath, function (err, data) {
		if (err) {
			throw err; 
	  	}
	  	XMLFileContent = data.toString();
	  	global.fullMusicJson = cleanXMLContent(XMLFileContent);
	  	makeMusicJSON(song.name, song.artist);

	  	createPage(songId);
	});
}
