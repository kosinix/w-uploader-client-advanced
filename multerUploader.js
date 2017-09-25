const multer  = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads') // The upload dir destination
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // The final name of file
  }
});

var multerOpts = { 
    storage: storage, // Storage options
    // Control which files are accepted
    fileFilter: function(req, file, cb){ 
        cb(null, true); // Allow all files
    },	
    // Limits of the uploaded data. Can help protect your site against denial of service (DoS) attacks.
    limits: {
        fieldNameSize: 100,	    // Max field name size	100 bytes
        fieldSize: 1000,	        // Max field value size	1MB
        fields:	Infinity,       // Max number of non-file fields	
        fileSize: Infinity,     // For multipart forms, the max file size (in bytes)	
        files: Infinity,        // For multipart forms, the max number of file fields	
        parts: Infinity,        // For multipart forms, the max number of parts (fields + files)	
        headerPairs: 2000,	    // For multipart forms, the max number of header key=>value pairs to parse	
    }, 
};
var uploader = multer(multerOpts).array('uploads');

module.exports = uploader;