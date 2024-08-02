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

// Your first API endpoint
app.post('/api/shorturl',  async (req, res) => {
  const { url } = req.body
  const shortUrl = shortId.generate();
  //create new url
  const newUrl = new ShortURL({
    original_url: url,
    short_url: shortUrl
  })
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
