let express = require('express')
let app = express()
const mongo = require('mongodb')
const MongoClient = mongo.MongoClient
const dotenv = require('dotenv') // require dontenv package to read local config file
dotenv.config() // reading local config file
let port = process.env.PORT || 8230; 
// will check if the PORT has value or not. if yes then use that else default value 8230
// it will run the application on the given port number 
const mongoURL = process.env.mongoURL;
// mongo url is database conectivity url

app.get("/", (req, res) => {
  res.send("Welcome to express");
});

app.get("/location",(req, res) => {
    db.collection("location").find().toArray((err, result) => {
        if(err) throw err
        res.send(result)
    })
})

app.get("/resturants", (req, res) => {
  db.collection("zomato")
    .find()
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

// connection with database
MongoClient.connect(mongoURL, (err, client) => {
    if(err) console.log("Failed to connect db")
    db = client.db("ZomatoClone")
    app.listen(port, () => {
      console.log("server is running at port ", port);
    });
})




