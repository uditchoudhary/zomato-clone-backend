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

app.get("/mealType", (req, res) => {
  db.collection("mealTypes")
    .find()
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

// app.get("/restaurants", (req, res) => {
//   db.collection("restaurants")
//     .find()
//     .toArray((err, result) => {
//       if (err) throw err;
//       res.send(result);
//     });
// });

app.get("/restaurants/", (req, res) => {
  let query = {};
  let stateId = Number(req.query.state_id);
  let mealId = Number(req.query.mealtype_id);
  console.log("Received value", mealId);
  if (stateId) {
    query = { state_id: stateId };
  } else if (mealId) {
    query = { "mealTypes.mealtype_id": mealId };
  }
  console.log("query", query);
  db.collection("restaurants")
    .find(query)
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

app.get("/filters/:mealtype_id", (req, res) => {
  let sort = { cost: 1 };
  let mealId = Number(req.params.mealtype_id);
  let cuisineId = Number(req.query.cuisineId);
  let lcost = Number(req.query.lcost);
  let hcost = Number(req.query.hcost);
  let query = {};
  if (req.query.sort) {
    sort = { cost: Number(req.query.sort) };
  }
  if (lcost && hcost && cuisineId) {
    query = {
      "mealTypes.mealtype_id": mealId,
      "cuisines.cuisine_id": cuisineId,
      $and: [{ cost: { $gt: lcost, $lt: hcost } }],
    };
  } else if (cuisineId) {
    query = {
      "mealTypes.mealtype_id": mealId,
      "cuisines.cuisine_id": cuisineId,
    };
  } else if (lcost && hcost) {
    query = {
      "mealTypes.mealtype_id": mealId,
      $and: [{ cost: { $gt: lcost, $lt: hcost } }],
    };
  } else {
    query = {
      "mealTypes.mealtype_id": mealId,
    };
  }
  db.collection("restaurants")
    .find(query)
    .sort(sort)
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
      console.log(result);
      res.send(result);
    });
});

app.get("/menu/:restId", (req, res) => {
  const restId = Number(req.params.restId);
  db.collection("restaurantsMenu")
    .find({ restaurant_id: restId })
    .toArray((err, result) => {
      if (err) throw err;
      console.log(result);
      res.send(result);
    });
});
// menu on basis of id
app.post("/menuItem", (req, res) => {
  console.log(req.body);
  if (Array.isArray(req.body)) {
    db.collection("restaurantsMenu")
      .find({ menu_id: { $in: req.body } })
      .toArray((err, result) => {
        if (err) throw err;
        res.send(result);
      });
  } else {
    res.send("Invalid Input");
  }
});
app.get("/restaurant/", (req, res) => {
  const restId = Number(req.params.restId);
  db.collection("restaurants")
    .find({ restaurant_id: restId })
    .toArray((err, result) => {
      if (err) throw err;
      console.log(result);
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
