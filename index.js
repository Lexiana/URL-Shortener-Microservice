require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const shortId = require('shortid');

const urlShema = new mongoose.Schema({
  original_url: String,
  short_url: String
})

const ShortURL = mongoose.model('ShortURL', urlShema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(express.urlencoded({extended: true}))

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(express.json());

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});
// check if the url is valid
const dns = require('dns');

function isValidUrl(url){
  const urlPattern = new RegExp('^(http|https)://', 'i')
  return urlPattern.test(url);
}

// POST API
app.post('/api/shorturl',  async (req, res) => {
  const { url } = req.body
  if(!isValidUrl(url)){
    return res.json({error: 'invalid url'});
  }
  const shortUrl = shortId.generate();
  //create new url
  const newUrl = new ShortURL({
    original_url: url,
    short_url: shortUrl
  })
  res.json({ greeting: 'hello API' });
});

app.get('api/shorturl/:short_url', async(req , res)=>{
  const { shortUrl } = req.params
  const urls = await ShortURL.findOne({short_url: shortUrl});
  if(urls) {
    res.redirect(urls.original_url);
  }else{
    res.status(404).json('No URL found')
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
