// Dependencies
// =============================================================
const express = require("express");
const path = require("path");
const fs = require('fs');
const util = require('util');

//This allows user to get/post to the external json folder
let dbNotes = require('./db/db.json');

const writeFileAsync = util.promisify(fs.writeFile);


// Sets up the Express App
// =============================================================
const app = express();
const PORT = process.env.PORT || 3000;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//This allows the server to have access to the public folder
app.use(express.static("public"));




// Routes
// =============================================================

// Basic route that sends the user first to the AJAX Page
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

app.get("/notes", function (req, res) {
  res.sendFile(path.join(__dirname, "./public/notes.html"));
});

// Displays all notes as json
app.get("/api/notes", function (req, res) {
  res.json(dbNotes);
});

app.get('/', function(req, res){
  res.redirect(path.join(__dirname, "./public/index.html"));
});

app.get('*', function(req,res){
  res.sendFile(path.join(__dirname, "./public/index.html"));
})


//Creates a path for post requesting new notes
//Why is this happening twice?
app.post("/api/notes", function (req, res) {
  //Console logging newNote shows ONE object 
  let newNote = req.body;

  // Using a RegEx Pattern to remove spaces from newNote
  // You can read more about RegEx Patterns later https://www.regexbuddy.com/regex.html
  let id = newNote.title.replace(/\s+/g, "").toLowerCase();

  newNote.id = id;

  dbNotes.push(newNote);


  //Why is this happening twice?? It is pushing twice when the post request occurs client-side but when done on postman it works
  writeFileAsync('./db/db.json', JSON.stringify(dbNotes)).then(function () {
    res.json(newNote);
  }).catch(err => {
    console.log(err);
  });
});

//The :id helps it look for the delete route
app.delete("/api/notes/:id", function (req, res) {
  let notes = dbNotes.filter(note => note.id !== req.params.id);

  dbNotes = notes;

  //dbNotes.push(notes);

  //This writes to the json file and ensures that the display doesn't begin until the file is written
  //Since db.json contains an array, dbNotes must be stringified
  writeFileAsync('./db/db.json', JSON.stringify(dbNotes)).then(function () {
    res.json(dbNotes);
  }).catch(err => {
    console.log(err);
  });

});


// Starts the server to begin listening
// =============================================================
app.listen(PORT, function () {
  console.log("App listening on PORT " + PORT);
});
