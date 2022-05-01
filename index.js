const express = require("express");
const cors = require("cors");
require("dotenv").config();
var jwt = require("jsonwebtoken");
const port = process.env.PORT || 4000;
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.csuob.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

async function run() {
  try {
    await client.connect();
    const productCollection = client.db("inventory").collection("product");

    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "1d",
      });
      console.log(user);
      res.send({ accessToken });
    });

    //Products
    app.get("/product", async (req, res) => {
      const query = {};
      const productCursor = productCollection.find(query);
      const product = await productCursor.toArray();
      res.send(product);
    });
    //Products
  } finally {
  }
}

run().catch(console.dir);
app.listen(port, () => {
  console.log("port started at", port);
});
