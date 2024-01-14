const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
//New imports

const cors = require("cors");
const httpServer = require("http").createServer(app); // Import and create an HTTP server
const { Server } = require("socket.io");
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Allow requests from this origin
    methods: ["GET", "POST"], // Specify the allowed HTTP methods
  },
});

const uri =
  "mongodb+srv://radiationcorporation2:z4HpUfzxQx5jLjZj@cluster0.tpz6mmk.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
app.use(cors());
app.use(express.json());

async function run() {
  try {
    const orderCollection = client.db("BikironStore").collection("Orders");
    const cartCollection = client.db("BikironStore").collection("cart");
    const libraryCollection = client.db("BikironStore").collection("library");
    const bookCollection = client.db("BikironStore").collection("allBooks");
    const packageCollection = client.db("BikironStore").collection("package");
    const userCollection = client.db("BikironStore").collection("users");
    const memberCollection = client.db("BikironStore").collection("members");
    const allPackages = require("./data/AllPackages.json");
    const singlePackages = require("./data/SinglePackage.json");

    io.on("connection", (socket) => {
      // Listen for incoming messages from a client
      socket.on("message", async (data) => {
        try {
          // Save the message to MongoDB
          await messageCollection.insertOne({
            text: data.text,
            sender: data.sender,
          });

          // Emit the received message to all connected clients, including the sender
          io.emit("message", { text: data.text, sender: data.sender });
        } catch (error) {
          console.error("Error while processing message:", error);
        }
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("A user disconnected");
      });
    });

    // api for loading all courses
    app.get("/allPackages", (req, res) => {
      res.send(allPackages);
    });
    // api for loading all courses
    app.get("/singlePackages", (req, res) => {
      res.send(singlePackages);
    });

    app.put("/addFollow", async (req, res) => {
      try {
        const userEmail = req.body.email;
        const videoId = req.body.id;

        // Assuming videoCollection is a MongoDB collection instance
        const video = await libraryCollection.findOne(
          { _id: new ObjectId(videoId) },
          { sort: { _id: 1 } } // Sort by _id in descending order (newest first)
        );

        if (video) {
          // Check if userEmail is not already in the followers array
          if (!video.followers.includes(userEmail)) {
            // Add userEmail to the followers array
            video.followers.push(userEmail);

            // Update the document in the collection
            await libraryCollection.updateOne(
              { _id: new ObjectId(videoId) },
              { $set: { followers: video.followers } }
            );

            res.json({ success: true, message: "User added to followers" });
          } else {
            res.json({ success: false, message: "User is already a follower" });
          }
        } else {
          res.json({ success: false, message: "Video not found" });
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    });

    // get method for finding the specific ticket for the user
    app.get("/library", async (req, res) => {
      const query = {};
      const cursor = libraryCollection.find(query);
      const message = await cursor.toArray();
      res.send(message);
    });
    app.get("/allBooks", async (req, res) => {
      const query = {};
      const cursor = bookCollection.find(query);
      const message = await cursor.toArray();
      res.send(message);
    });
    app.get("/allBooksPackage", async (req, res) => {
      const query = {};
      const cursor = packageCollection.find(query);
      const message = await cursor.toArray();
      res.send(message);
    });
    app.get("/cart", async (req, res) => {
      const query = {};
      const cursor = cartCollection.find(query);
      const message = await cursor.toArray();
      res.send(message);
    });

    app.get("/member", async (req, res) => {
      const query = {};
      const cursor = memberCollection.find(query);
      const message = await cursor.toArray();
      res.send(message);
    });

    app.delete("/deleteBook/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookCollection.deleteOne(query);
      res.send(result);
    });

    app.delete("/deleteBookCart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });
    app.delete("/deletePackage/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await packageCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });
    // post for users method
    app.post("/addOrder", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });
    app.post("/addUsers", async (req, res) => {
      const order = req.body;
      const result = await userCollection.insertOne(order);
      res.send(result);
    });
    app.post("/addMember", async (req, res) => {
      const order = req.body;
      const result = await memberCollection.insertOne(order);
      res.send(result);
    });
    app.post("/addCart", async (req, res) => {
      const order = req.body;
      const result = await cartCollection.insertOne(order);
      res.send(result);
    });
    app.post("/addBook", async (req, res) => {
      const order = req.body;
      const result = await bookCollection.insertOne(order);
      res.send(result);
    });
    app.post("/addPackage", async (req, res) => {
      const order = req.body;
      const result = await packageCollection.insertOne(order);
      res.send(result);
    });
    // post for users method
    app.post("/createLibrary", async (req, res) => {
      const order = req.body;
      const result = await libraryCollection.insertOne(order);
      res.send(result);
    });

    // get method for finding the specific ticket for the user
    app.get("/message", async (req, res) => {
      const query = {};
      const cursor = messageCollection.find(query);
      const message = await cursor.toArray();
      res.send(message);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Bikiron Server is running");
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
