require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const urlparser = require("url");
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const app = express();

//MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const urlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true,
  },
  short_url: {
    type: Number,
    unique: true,
  },
});

urlSchema.plugin(AutoIncrement, { inc_field: "short_url" });

const Url = mongoose.model("Url", urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/public", express.static(`${process.cwd()}/public`));
app.use(express.json());

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// POST API
app.post("/api/shorturl", async (req, res) => {
  const url = req.body.url;
  const hostname = urlparser.parse(url).hostname;
  dns.lookup(hostname, async (err, address) => {
    if (err || !address) {
      return res.json({ error: "invalid url" });
    } else {
      try {
        // check if url exists
        let urlDoc = await Url.findOne({ original_url: url });

        if (!urlDoc) {
          // create a new url
          urlDoc = new Url({ original_url: url });
          await urlDoc.save();
        }
        // return the json
        res.json({
          original_url: urlDoc.original_url,
          short_url: urlDoc.short_url,
        });
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
      }
    }
  });
});

app.get("/api/shorturl/:shortUrl", async (req, res) => {
  const { shortUrl } = req.params;
  try {
    const urlDoc = await Url.findOne({ short_url: shortUrl });
    
    if (urlDoc) {
      res.redirect(urlDoc.original_url);
    } else {
      res.status(404).json("No URL found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
