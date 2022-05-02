const express = require("express");
const cors = require("cors");
require("dotenv").config();
var jwt = require("jsonwebtoken");
const port = process.env.PORT || 4000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { decode } = require("jsonwebtoken");

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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden Access" });
    }

    req.decoded = decoded;
  });
  next();
}

async function run() {
  try {
    await client.connect();
    const productCollection = client.db("inventory").collection("product");

    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "1d",
      });
      // console.log(user);
      res.send({ accessToken });
    });

    //Products
    app.get("/product", async (req, res) => {
      const query = {};
      const productCursor = productCollection.find(query);
      const product = await productCursor.toArray();
      res.send(product);
    });

    //find single Product
    app.get("/product/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      console.log("email", email);
      console.log("decoded email", decodedEmail);
      if (email === decodedEmail) {
        const query = { _id: ObjectId(id) };
        const product = await productCollection.findOne(query);
        // console.log(product);
        res.send(product);
      } else {
        res.status(403).send({ message: "Access Forbidden" });
      }
    });

    //Products
  } finally {
  }
}

run().catch(console.dir);
app.listen(port, () => {
  console.log("port started at", port);
});
