function hslToHex(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}



function hslToRgba(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return `rgba(${r},${g},${b},0.2)`;
}


function colorify(i, totalValues) {
    var hue = Math.min(360, Math.floor(360 * i/totalValues));
    //console.log(i, totalValues);
    return hslToHex(hue, 100, 70);
}


var pitchDict = {
  "C": 0,
  "D": 2,
  "E": 4,
  "F": 5,
  "G": 7,
  "A": 9,
  "B": 11
};

var accToStepDict = {
    "#": 1,
    "b": -1,
    "n": 0
};

var stepToAccDict = {
    '1' : "#",
    '-1': "b",
    '0' : "n"
};

class Note {
    constructor(pitch, octave, acc, duration, timeCode, position) {
        var fA4 = 440; //Base frequency (for an A4)
        var a = 1.059463094359;

        //Note parameters
        this.pitch = pitch;
        this.octave = octave;
        this.acc = acc;
        var n = pitchDict[pitch]+accToStepDict[acc] + octave*12 - (pitchDict['A'] + 4*12);
        this.freq = fA4 * Math.pow(a, n);
        this.isRest == false;
        this.isUnpitched = false;
        this.duration = duration;
        this.timeCode = timeCode;
        this.position = position;
    }
}


class Rest {
    constructor(duration, timeCode, position) {
        this.pitch = 0;
        this.octave = 0;
        this.acc = 'n';
        this.freq = 0;
        this.isRest == true;
        this.isUnpitched = false;
        this.duration = duration;
        this.timeCode = timeCode;
        this.position = position;
    }
}


class Unpitched {
    constructor(duration, timeCode, position) {
        this.pitch = 0;
        this.octave = 0;
        this.acc = 'n';
        this.freq = 0;
        this.isRest == false;
        this.isUnpitched = true;
        this.duration = duration;
        this.timeCode = timeCode;
        this.position = position;
    }
}


global.pitchDict = pitchDict;
global.stepToAccDict = stepToAccDict;
global.accToStepDict = accToStepDict;
global.colorify = colorify;

global.Note = Note;
global.Unpitched = Unpitched;
global.Rest = Rest;