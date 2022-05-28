let express = require("express");
let app = express();
const mongo = require("mongodb");
const MongoClient = mongo.MongoClient;
const dotenv = require("dotenv"); // require dontenv package to read local config file
dotenv.config(); // reading local config file
let port = process.env.PORT || 8230;
// will check if the PORT has value or not. if yes then use that else default value 8230
// it will run the application on the given port number
const mongoURL = process.env.mongoURL;
const bodyParser = require("body-parser");
const cors = require("cors");
// mongo url is database conectivity url

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Welcome to express");
});

app.get("/location", (req, res) => {
  db.collection("location")
    .find()
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

app.get("/restaurants", (req, res) => {
  db.collection("restaurants")
    .find()
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

app.get("/restaurant/:restId", (req, res) => {
  const restId = Number(req.params.restId);
  db.collection("restaurants")
    .find({ restaurant_id: restId })
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

app.post("/filterRestaurants", (req, res) => {
  let { mealtype, cuisine, location, lcost, hcost, page, sort } = req.body;
  page = page ? Number(page) : 1;
  sort = sort ? sort : 1;
  let filterPayload = {};
  const itemsPerPage = 5;
  let startIndex = itemsPerPage * page - itemsPerPage;
  let endIndex = itemsPerPage * page;

  if (mealtype) {
    filterPayload["mealTypes.mealtype_id"] = Number(mealtype);
  }
  if (mealtype && cuisine) {
    console.log(req.body);
    filterPayload["mealTypes.mealtype_id"] = Number(mealtype);
    filterPayload["cuisines.cuisine_name"] = { $in: cuisine };
  }
  if (mealtype && hcost && lcost) {
    filterPayload["mealTypes.mealtype_id"] = Number(mealtype);
    filterPayload["cost"] = { $lte: hcost, $gte: lcost };
  }
  if (mealtype && cuisine && lcost && hcost) {
    filterPayload["mealTypes.mealtype_id"] = Number(mealtype);
    filterPayload["cost"] = { $lte: hcost, $gte: lcost };
    filterPayload["cuisines.cuisine_name"] = { $in: cuisine };
  }
  if (mealtype && location) {
    filterPayload["mealTypes.mealtype_id"] = Number(mealtype);
    filterPayload["location_id"] = Number(location);
  }
  if (mealtype && location && cuisine) {
    filterPayload["mealTypes.mealtype_id"] = Number(mealtype);
    filterPayload["location_id"] = Number(location);
    filterPayload["cuisines.cuisine_name"] = { $in: cuisine };
  }
  if (mealtype && location && lcost && hcost) {
    filterPayload["mealTypes.mealtype_id"] = Number(mealtype);
    filterPayload["cost"] = { $lte: hcost, $gte: lcost };
    filterPayload["location_id"] = Number(location);
  }
  if (mealtype && location && cuisine && lcost && hcost) {
    filterPayload["mealTypes.mealtype_id"] = Number(mealtype);
    filterPayload["cost"] = { $lte: hcost, $gte: lcost };
    filterPayload["location_id"] = Number(location);
    filterPayload["cuisines.cuisine_name"] = { $in: cuisine };
  }

  db.collection("restaurants")
    .find(filterPayload)
    .skip(startIndex)
    .limit(endIndex)
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

// connection with database
MongoClient.connect(mongoURL, (err, client) => {
  if (err) console.log("Failed to connect db");
  db = client.db("ZomatoClone");
  app.listen(port, () => {
    console.log("server is running at port ", port);
  });
});
