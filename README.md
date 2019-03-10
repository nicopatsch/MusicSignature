# Music Signature

## What is this?

This project aims at showing the **repetition in music**. Select a song, and you will see, for each instrument playing in the song, the pattern that the notes create, the *signature* of the instrument. On a *signature*, each column and each rown corresponds to a note. When a pixel is lit up, it means that the two corresponding notes (the one of the row and the one of the column) are the same.

You can modify the *number of notes in a repetition* in order to select melodies that are longer or shorter. If you select 5, for instance, you will only see the notes that belong to a melody of 5 notes or more and that is repeted at least twice across the song.

## How do I use it?

Just visit the web page following [this link](http://nicopatsch.github.io/MusicSignature).

Hope you enjoy it!

---

## Contributors

Thank you [Sixtine Philippe](https://sixtinephilippe.myportfolio.com/) for the great work on the design and all the inpiration.

This project was largely inspired by [SongSim](https://colinmorris.github.io/SongSim/), a work by **Colin Morris** that shows the repetition in the lyrics of songs.

## TODO
This is what I'm planning to do next:

- [x] Implement an update button
- [ ] Implement an automatic update feature. This might be long because you'll need to bind visual elements to data... VueJS?
- [ ] Add an explanation page (like [this about page on SongSim](https://colinmorris.github.io/SongSim/#/about)) with examples and explanation of the different types of patterns.
- [ ] Add a gallery (like [this one on SongSim](https://colinmorris.github.io/SongSim/#/gallery))
- [ ] Make a good hover experience: hover on all available melodies, display more informations on hover...? (in progress...🔜)
- [ ] Implement an approximative melody comparaison os that 2 almost identical melodies (90 notes out of 100 for instance) still appear identical on the matrix.
- [ ] Enable 2 melodies seperated by a fixed amount of half steps still appear as the same (or almost, like differenciated by a color or something). For instance G-A-B-G and C-D-E-C sound almost like the same melodies (think Frère Jacques) but on 2 different keys seperated by 5 half steps.
- [ ] Implement a zooming feature
- [ ] Improve fluidity: cache preprocessing on server and make loading more visual (so that it doesn't look like a bug)

---

👋 Hey! If you like this project, think of checking my other projects on [my portfolio](http://nicopatsch.github.io/portfolio). 👋