var musicXML;
var musicJson;
var fullMusicJson;


function getByName(object, name) {
    return object.children.find(function(element) {
        return element.name == name;
    });
}


var readMusicXMLFile = function(event) {
    var input = event.target;

    var fileContent;
    var reader = new FileReader();  
    
    if(input.files.length <= 0) return;

    var file = input.files[0];

    reader.onload = function(e) {  
        // get file content 
        fileContent = e.target.result;
        console.log("loaded xml file");
        
        if (window.DOMParser) {
            parser = new DOMParser();
            musicXML = parser.parseFromString(fileContent, "text/xml");
            

            // This will delete all the unnecesary line breaks
            var regex = /(\r|\n|\r\n) */g; 
            fileContent = fileContent.replace(regex, "");
            fullMusicJson = parseXml(fileContent);
            
            displayMatrixXML();
        }
    }
    reader.readAsText(file);
};



function reduceJsonNote(note, timeCode, notePosition) {
    //Get the duration of the note
    var duration = parseInt(getByName(note, "duration").children[0].text);



    //Get the pitch of the note
    var pitch = note.children.find(function(element) {
        return  element.name == "pitch" ||
                element.name == "rest"  ||
                element.name == "unpitched";
    });

    //If it's a rest and not a note, we return a Rest or an Unpitched object
    if(pitch.name == "rest") return new Rest(duration, timeCode, notePosition);
    if(pitch.name == "unpitched") return new Unpitched(duration, timeCode, notePosition);
    

    //Get the step, accidential and octave
    var step = pitch.children.find(function(element) {
        return element.name == "step";
    }).children[0].text;

    var accidentalNode = pitch.children.find(function(element) {
        return element.name == "alter";
    });
    var accidental = accidentalNode ? stepToAccDict[accidentalNode.children[0].text] : 'n';


    var octave = pitch.children.find(function(element) {
        return element.name == "octave";
    }).children[0].text;

    cleanNote = new Note(step, octave, accidental, duration, timeCode, notePosition);

    if(!cleanNote.isUnpitched && !cleanNote.isRest && cleanNote.freq==0) {
        console.log("There is an issue with the new note : it is supposed to be a normal note but freq == 0.");
    }

    return cleanNote;
}

function checkNoteIsChord(note) {
    //Check if note is a chord. It will enable us to flag it because will create problems.
    var chord = note.children.find(function(element) {
        return  element.name == "chord";
    });
    return chord != null;
}

function checkNoteIsUnPitched(note) {
    //Check if note is unpitched.
    var unpitched = note.children.find(function(element) {
        return  element.name == "unpitched";
    });
    return unpitched != null;
}


function getInstrumentName(part) {
    //Getting the instrument name (aaarf)
    var partID = part.attributes.id;

    var partList = getByName(fullMusicJson.children[0], "part-list");
    var instrumentPart = partList.children.find(function(element) {
        return element.attributes.id == partID;
    });
    var instrumentNameObj = getByName(instrumentPart, "score-instrument");
    return instrumentNameObj.children[0].children[0].text;
}

function reduceJsonPart(part) {
    //Get basic info on the part
    var partID = part.attributes.id;

    var instrumentName = getInstrumentName(part);

    var minFreq = 1000, maxFreq = 0;
    var cleanJsonMeasures = [];
    var noteIndices = [];

    var rawJsonMeasures = part.children;
    var nbChordsInPart = 0, nbNotesInPart = 0, nbUnpitchedInPart = 0;
    var newNote;

    var totalDuration = 0;
    for(measure in rawJsonMeasures) {
        var cleanMeasure = [];
        var nbNotesInMeasure = 0;
        for(child in rawJsonMeasures[measure].children) {
            var element = rawJsonMeasures[measure].children[child];
            if(element.name == "note") {
                if(checkNoteIsChord(element)) nbChordsInPart++;
                if(checkNoteIsUnPitched(element)) nbUnpitchedInPart++;

                newNote = reduceJsonNote(element, totalDuration, nbNotesInPart);
                if(newNote.freq > maxFreq) maxFreq = newNote.freq;
                if(newNote.freq < minFreq && newNote.freq!=0) minFreq = newNote.freq;
                
                cleanMeasure.push(newNote);
                noteIndices.push( { 'measure': measure, 'note': nbNotesInMeasure } );
                totalDuration+=newNote.duration;
                nbNotesInMeasure++;
                nbNotesInPart++;
            }
        }
        //console.log(cleanMeasure);
        cleanJsonMeasures.push({ 'measureId': measure, 'notes': cleanMeasure });
    }

    return { 'partID': partID, 'instrumentName': instrumentName, 'measures': cleanJsonMeasures, 'nbOfNotes': nbNotesInPart, 'noteIndices': noteIndices, 'nbOfChords': nbChordsInPart, 'nbOfUnpitched': nbUnpitchedInPart, 'minFreq':minFreq, 'maxFreq': maxFreq, 'totalDuration': totalDuration };
}



function reduceJsonFile() {
    var children = fullMusicJson.children[0].children;

    //Get basic info on the song
    var songName;
    var artist;
    for(childIndex in children) {
        if(children[childIndex].name == "credit") {
            if(!songName) {
                songName = children[childIndex].children[0].children[0].text;
            }
            else if(!artist) {
                artist = children[childIndex].children[0].children[0].text;
            }
            else {
                break;
            }
        }
    }


    //Get the parts and reduce them
    var jsonParts = [];
    for(childIndex in children) {
        if(children[childIndex].name == "part") {
            jsonParts.push(reduceJsonPart(children[childIndex]));
        }
    }




    console.log(songName, artist);
    return { 'songName': songName, "artist": artist, 'parts': jsonParts};
}