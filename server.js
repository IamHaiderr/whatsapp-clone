//importing modules
import express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
import Pusher from "pusher";
//app config
const app = express();
const port = 9000 || process.env.PORT;

const pusher = new Pusher({
  appId: "1366463",
  key: "e6d895bfcf7c633c2454",
  secret: "a25a9ca2d9a3ba79506e",
  cluster: "eu",
  useTLS: true,
});

//middlewares
app.use(express.json());
//DB config
const connection_url =
  "mongodb+srv://Hadi258:Haider123@whatsapp-clone.zyrxb.mongodb.net/whatsappclone?retryWrites=true&w=majority";
await mongoose.connect(connection_url, {});

const db = mongoose.connection;
db.once("open", () => {
  console.log("DB Connected");
});

const msgCollection = db.collection("messagecontents");
const changeStream = msgCollection.watch();
changeStream.on("change", (change) => {
  console.log("A change occured", change);
});

if (change.operationType === "insert") {
  const messageDetails = change.fullDocument; 
  pusher.trigger("messages", "inserted", {
    name: messageDetails.user,
    message: messageDetails.message,
  });
} else {
  console.log("Error triggering pusher");
}

//api routes
app.get("/", (req, res) => {
  res.status(200).send("hellow world");
});

app.get("/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;

  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

//listener
app.listen(port, () => {
  console.log(`server is listening on localhost: ${port}`);
});
