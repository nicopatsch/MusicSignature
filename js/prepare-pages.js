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
	var songList = musicList.genres[0].titleList;

	for(var i = 1; i < /*songList.length*/2 ; i++) {
		var song = songList[i];
		loadFile(song);

		setTimeout(function() {
			var resultingHTML;
			// resultingHTML = createPage();




			fs.readFile("./index.html", function (err, data) {
				if (err) {
					throw err; 
			  	}

			
			  	HTMLFileContent = data.toString();
			  	//HTMLFileContent = "<div><p id='id1'>Text</p></div>";

			  	const { JSDOM } = jsdom;

			    const dom = new JSDOM(HTMLFileContent);
			    const { document } = dom.window;

			    const $ = (require('jquery'))(dom.window);

			    global.document = document;
				global.$ = $;
				global.jQuery = $;

				// console.log(document.documentElement.outerHTML);
				displayMatrixXML();

				// console.log($('html').html());
				resultingHTML = $('html').html();
				// console.log($('html').html());
				//console.log(document.documentElement.outerHTML);
				console.log(resultingHTML);

				printHTMLToFile(song, resultingHTML);

			});




			

    	}, 1000);


	}

}


function printHTMLToFile(song, htmlString) {
	fs.writeFile("./output/"+song.filename+".html", htmlString, function(err) {
	    if(err) {
	    	console.log("nooooope");
	        return console.log(err);
	    }

	    console.log("The file was saved!");
	});
}



function createPage() {
	fs.readFile("./index.html", function (err, data) {
		if (err) {
			throw err; 
	  	}

	
	  	HTMLFileContent = data.toString();
	  	//HTMLFileContent = "<div><p id='id1'>Text</p></div>";

	  	const { JSDOM } = jsdom;

	    const dom = new JSDOM(HTMLFileContent);
	    const { document } = dom.window;

	    const $ = (require('jquery'))(dom.window);

	    global.document = document;
		global.$ = $;
		global.jQuery = $;

		// console.log(document.documentElement.outerHTML);
		displayMatrixXML();

		// console.log($('html').html());
		result = $('html').html();
		return result;
		// console.log($('html').html());
		//console.log(document.documentElement.outerHTML);


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


function loadFile(song) {
	var filepath = "./music-parts/classic/"+song.filename+".xml";

	var XMLFileContent;
	fs.readFile( filepath, function (err, data) {
		if (err) {
			throw err; 
	  	}
	  	XMLFileContent = data.toString();
	  	global.fullMusicJson = cleanXMLContent(XMLFileContent);
	  	makeMusicJSON(song.name, song.artist);
	});
}















