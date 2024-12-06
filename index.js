require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const db_password = process.env.pass;
const urlparser = require('url');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
const dns = require('node:dns')


//db connection


const { MongoClient, ServerApiVersion } = require('mongodb');
const { url } = require('inspector');
const uri = `mongodb+srv://nico12:nico12@urlshortener.till4.mongodb.net/?retryWrites=true&w=majority&appName=urlshortener`;


mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

/*
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const db = client.db("urlshortener");
const urls = db.collection("urls");
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);*/




// Basic Configuration
const port = process.env.PORT || 3000;

const URLSchema = new mongoose.Schema({
  original_url: { type: String, required: true, unique: true },
  short_url: { type: String, required: true, unique: true }
});

let URLModel = mongoose.model("url", URLSchema)

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.use("/", bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/shorturl/:short_url', function (req, res) {
  let short_url = req.params.short_url;
  URLModel.findOne({ short_url: short_url }).then((foundURL) => {
    console.log(foundURL)
    if (foundURL) {
      let original_url = foundURL.original_url;
      res.redirect(original_url)
    } else {
      res.json({ error: "The shorturl does not exist" })
    }

  })

});

// Your first API endpoint
app.post('/api/shorturl', function (req, res) {
  const url = req.body.url;
  // const dnslookup = dns.lookup(urlparser.parse(url).hostname,
  // async(err,address) =>{
  //   if (!address) {
  //     res.json({error: "Invalid URL"})
  //   }else{

  //     const urlCount = await urls.countDocument({})

  //     const urlDoc = {
  //       url: url,
  //       short_url: urlCount
  //     }
  //     const result = await urls.insertOne({urlDoc})
  //     console.log(result)
  //     res.json({
  //       original_url:url,
  //       short_url:  urlCount
  //     })

  //   }
  // }
  //)

  //validate url
  try {
    urlObj = new URL(url);
    console.log(urlObj)
    dns.lookup(urlObj.hostname, (err, address, family) => {
      // If the DNS domain does not exist no address returned
      if (!address) {
        res.json({ error: "Invalid url" })
      }
      //We have a valid URL!
      else {
        let original_url = urlObj.href;
        //Get the latest short_url

        URLModel.find({}).sort({ short_url: "desc" }).limit(1).then(
          (latestURL) => {
            if (latestURL.length > 0) {
              short_url = parseInt(latestURL[0].short_url) + 1;
            }
            resObj = {
              original_url: original_url,
              short_url: short_url
            }
            //Create an entry in the db
            let newURL = new URLModel(resObj)
            newURL.save();
            res.json(resObj)
          }
        )
      }
    })

  } catch (error) {
    res.json({ error: "Invalid url" })
  }

});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
// let short_url = 1;
// res.json({
//   original_url: original_url,
//   short_url: short_url
// })
// res.Obj = {
//   original_url:original_url,
//   short_url: short_url
// }