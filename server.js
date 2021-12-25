require('dotenv').config();
const express = require('express');
const cors = require('cors');
//module required
const mongoose = require('mongoose');
const {lookup} = require('dns');
const { doesNotMatch } = require('assert');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({extended:false}));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});


//Code created by David Hernandez (RaveFuzzball)
//Mongoose connection
mongoose.connect(process.env.URI)
  .then(() => console.log('DB is Connected'))
  .catch(err => console.error(err));
//Mongoose link model
const linkModel = mongoose.Schema({
  original: String,
  short: String
}); 

const link = mongoose.model('link',linkModel);
//Functions
function randomNumber(max){
  return Math.floor(Math.random() * max) + 1;
}

function cutLink(fullLink){
  if(fullLink.includes('http')){
    iCut = fullLink.indexOf('/') + 2;
    return fullLink.substring(iCut);
  }else{
    return fullLink
  }
}

//Create a new short url
app.post('/api/shorturl', (req, res) => {
  var originalLink = req.body.url;
  var cutUrl = cutLink(originalLink);
  lookup(cutUrl,(err) => {
    if(err){
      console.error(err);
      res.json({error: 'invalid url'});
      return
    }
    res.json({original_url:cutUrl});
  })
});

//Redirect to short url
app.get('/api/shorturl/:short_url',async (req, res) => {
  const url = await link.findOne({short:req.params.short_url}); 
  if(url){
    res.redirect(url.original);
  }else{
    res.json({ error: 'invalid url' });
  }
  
});