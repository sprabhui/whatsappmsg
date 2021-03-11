const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http');
const cors = require('cors');
const https = require('https');
var multer = require('multer');
const axios = require('axios');

const accountSid = 'AC85c3d68ce38e2c1d55a21b6e905ef03d'; 
const authToken = 'abf9e5ab6d81687e0506717797dab8c0'; 
const client = require('twilio')(accountSid, authToken); 

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(cors());

let options = {
		pfx: fs.readFileSync('rp-onlinereg.pfx'),
		passphrase: '123'
	};
var sslSrv = null;
let upload = multer({ dest: '/images/'});
var type = upload.single('imgUploader');

app.use('/resources',express.static(__dirname + '/public/images'));

app.post('/upload', type, function (req,res) {

  /** When using the "single"
      data come in "req.file" regardless of the attribute "name". **/
  var tmp_path = req.file.path;

  /** The original name of the uploaded file
      stored in the variable "originalname". **/
  var target_path = 'public/images/' + req.file.originalname;
  var fullUrl = req.protocol + '://' + req.get('host');
  /** A better way to copy the uploaded file. **/
  var src = fs.createReadStream(tmp_path);
  var dest = fs.createWriteStream(target_path);
  src.pipe(dest);
  var apiurl = fullUrl+"/sendmsg"
  src.on('end', function() { 
  axios.post(apiurl, {
    to: req.body.to,
	from: 'whatsapp:+14155238886',
    body: req.body.body,
	mediaUrl: fullUrl+"/resources/"+req.file.originalname
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
  res.json({"Status":"Successfully Sent"}); });
  src.on('error', function(err) { res.json('error'); });

});


app.post('/sendmsg', function(req, res,next) {
  let content; 
  if(req.body.mediaUrl)
  {
	  content = { 
         body: req.body.msg,
         from: 'whatsapp:+14155238886',       
         to: req.body.to,
		 mediaUrl: req.body.mediaUrl
       }
  }
  else{
	  content = { 
         body: req.body.msg,
         from: 'whatsapp:+14155238886',       
         to: req.body.to
	  }
  }
  client.messages 
      .create(
         content
      ) 
      .then(message => console.log(message)) 
      .done();
  console.log(content);
   res.send(content);
});

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images/');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
 
 

console.log("The HTTPS server is up and running");

s