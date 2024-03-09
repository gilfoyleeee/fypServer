// http server for our app created

const app = require("./app");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const path = require("path");

process.on("uncaughtException", (err) => {
  console.log(err);
  process.exit(1);
});

const http = require("http");
const User = require("./models/user");
const FriendRequest = require("./models/frnRequest");

const httpserver = http.createServer(app);

const socketioServer = new Server(httpserver, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const DB = process.env.DB_url.replace("<password>", process.env.DB_pw);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log("MongoDB sucessfully connected !");
  })
  .catch((err) => {
    console.log(err);
  });

const port = process.env.PORT || 8000;

httpserver.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

//getting uid from client with requesting socket connection
socketioServer.on("connection", async (scktio) => {
  console.log(JSON.stringify(scktio.handshake.query));
  console.log(scktio); //socketio connection properties
  const uIDfromSocket = scktio.handshake.query["uIDfromSocket"];
  const socket_conID = scktio.id;
  console.log(`User connected sucessfully ${uIDfromSocket}`);

  if (Boolean(uIDfromSocket)) {
    await User.findByIdAndUpdate(uIDfromSocket, {
      socket_conID,
      status: "Online",
    });
  }
  //we can write our socket event listeners here...
  socketioServer.on("frn_request", async (data) => {
    console.log(data.to);
    //to contain userid from database and from is sender
    const reciever = await User.findById(data.to).select("uIDfromSocket");
    const sender = await User.findById(data.to).select("uIDfromSocket");

    //friend request
    await FriendRequest.create({
      sender: data.from,
      reciever: data.to,
    });

    //emit event => newFrnReq
    scktio.to(reciever.socket_conID).emit("newFriendRequest", {
      message: "Got a new Friend Request !",
    });
    //emit event=> req sent
    scktio.to(sender.socket_conID).emit("friendRequestSent", {
      message: "Friend Request Sent Successfully !",
    });
  });

  socketioServer.on("accept_request", async (data) => {
    console.log(data);

    const request_doc = await FriendRequest.findById(data.frnReqID);
    console.log(request_doc);

    //requestID
    const sender = await User.findById(request_doc.sender);
    const reciever = await User.findById(request_doc.reciever);

    sender.friends.push(request_doc.reciever);
    reciever.friends.push(request_doc.sender);

    await reciever.save({ new: true, validateModifiedOly: true });
    await sender.save({ new: true, validateModifiedOly: true });

    await FriendRequest.findByIdAndDelete(data.frnReqID);

    scktio.to(sender.socket_conID).emit("frnReq_accepted", {
      message: "Friend Request Accepted !",
    });
    scktio.to(reciever.socket_conID).emit("frnReq_accepted", {
      message: "Friend Request Accepted !",
    });
  });

  //handle text and link messages
  //data contain sender, reciever and text message
  socketioServer.on("textmsg", (txtdata) => {
    console.log("Text Message recieved !", txtdata);
    //if convo doesn't exist between two users, create a new convo

    //save to db

    //emit incoming message to reciever

    //emit outgoing message to sender
  });

  socketioServer.on("fileMsg", (filedata) => {
    console.log("File message recieved !", filedata);

    //filedata contain sender, reciever, text and file

    const fileExtension = path.extname(filedata.file.name);

    //generate a unique filename
    const fileName = `${Date.now()}_${Math.floor(
      Math.random() * 1000
    )}${fileExtension}`;

    //upload file
    //if convo doesn't exist between two users, create a new convo

    //save to db

    //emit incoming message to reciever

    //emit outgoing message to sender
  });

  socketioServer.on("end", async (data) => {
    //find user by id and set status to offline
    if (data.user_id) {
      await User.findByIdAndUpdate(data.user_id, { status: "Offline" });
    }
    //broadcast user_disconnected

    console.log("Closing connection !");
    socketioServer.disconnect(0);
  });
});

process.on("unhandledRejection", (err) => {
  console.log(err);
  httpserver.close(() => {
    process.exit(1);
  });
});
