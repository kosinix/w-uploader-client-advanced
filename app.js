const path = require('path');
const fs = require('fs');
const express = require('express');
const multerUploader  = require('./multerUploader');
const inspect = require('util').inspect;
const Busboy = require('busboy');

// Create express 
const app = express();

// No views, just static files
app.use(express.static('public'));

app.post('/upload', function(req, res){
  
  multerUploader(req, res, function (err) {
    if (err) {
      // An error occurred when uploading
      return res.status(400).send(err.message);
    }

    // Everything went fine
    console.log(req.files);
    res.send(JSON.stringify(req.files));
    
  });
});

// Handle Plupload using busboy 
//
app.post('/upload-busboy', function(req, res){
  
  var busboy = new Busboy({ headers: req.headers });
    
    // Hold upload session state
    // This is built on the assumption that Plupload send chunks in SEQUENTIAL order. Otherwise this wont work.
    var finalName = '';
    var chunks = 1;
    var chunk = 0;

    // Busboy works on field first
    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
      console.log('Field [' + fieldname + ']: value: ' + inspect(val));

      // Store state
      if(fieldname=='name'){
        finalName = './uploads/'+val;
      }
      if(fieldname=='chunk'){
        chunk = val;
      }
      if(fieldname=='chunks'){
        chunks = val;
      }
    });

    // Next busboy works on file
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      // We re-build chunks by simply appending data to the file (uploaded file).
      // However, if a file exists on the same path, appending data to it would result in a corrupted file.
      // To prevent this, use write+truncate mode on the first chunk (chunk 0). This will replace an existing file on the same path.
      // Otherwise on succeeding chunks, use append mode.
      if(chunk==='0'){ 
        // On first chunk, open stream in write truncate mode.
        // This works on a single continuous file too (a file with 1 chunk only).
        var writeStream = fs.createWriteStream(finalName, {flags:'w'});
        console.log('OPEN stream in write+truncate mode');
      } else {
        // On succeeding chunks of the same file, use append mode.
        console.log('OPEN stream in append mode');
        var writeStream = fs.createWriteStream(finalName, {flags:'a'});
      }
      console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
      file.pipe(writeStream); // Write file data to our stream
    });

    // Busboy is done
    busboy.on('finish', function() {
      
      console.log('Done parsing form!');
      res.status(303).send('success');
    });
    req.pipe(busboy);
});

app.listen(3000, function () {
  console.log('App running...');
});