require('dotenv').config();
const express = require('express');
const cors = require('cors');
//module required
const mongoose = require('mongoose');
const dns = require('dns');

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

async function linkCreate(req, res) {
  let shortUrl = randomNumber(10000);
  const linkSearched = await link.findOne({short: shortUrl});
  if(linkSearched){
    linkCreate();
  }else{
    const linkSearchedByName = await link.findOne({original: req.body.url});
    if(linkSearchedByName){
      res.json({ original_url : linkSearchedByName.original, short_url : linkSearchedByName.short});
    }else{
      var newLink = new link({
        original: req.body.url,
        short: shortUrl
      });
      await newLink.save();
      res.json({ original_url : newLink.original, short_url : newLink.short});
    }
  }
}

//Create a new short url
app.post('/api/shorturl', (req, res) => {
  dns.lookup(cutLink(req.body.url),(err) => {
    if(err){
      res.json({ error: 'invalid url' });
      return
    }else{
      linkCreate(req, res);
      return
    }
  });
  
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