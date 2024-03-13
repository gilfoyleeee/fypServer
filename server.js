// http server for our app created

const app = require("./app");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const path = require("path");

process.on("uncaughtException", (err) => {
  console.log(err);
  console.log("UNCAUGHT Exception! Shutting down ...");
  process.exit(1); // Exit Code 1 indicates that a container shut down, either because of an application failure.
});

const http = require("http");
const User = require("./models/user");
const FriendRequest = require("./models/frnRequest");
const directMsg = require("./models/DirectMessage");

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
    // useNewUrlParser: true,
    // // useCreateIndex: true,
    // // useFindAndModify: false,
    // useUnifiedTopology: true,
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
  // console.log(JSON.stringify(scktio.handshake.query));
  // console.log(scktio); //socketio connection properties
  const user_id = scktio.handshake.query["user_id"];
  const socket_id = scktio.id;
  console.log(`User connected sucessfully ${socket_id}`);

  if (user_id != null && Boolean(user_id)) {
    try {
      User.findByIdAndUpdate(user_id, {
        socket_id: scktio.id,
        status: "Online",
      });
    } catch (e) {
      console.log(e);
    }
  }
  //we can write our socket event listeners here...
  scktio.on("frn_request", async (data) => {
    // console.log(data.to);
    //to contain userid from database and from is sender
    const to = await User.findById(data.to).select("socket_id");
    const from = await User.findById(data.to).select("socket_id");

    //friend request
    await FriendRequest.create({
      sender: data.from,
      reciever: data.to,
    });

    //emit event => newFrnReq
    socketioServer.to(to?.socket_id).emit("new_friend_request", {
      message: "Got a new Friend Request !",
    });
    //emit event=> req sent
    socketioServer.to(from?.socket_id).emit("request_sent", {
      message: "Friend Request Sent Successfully !",
    });
  });

  scktio.on("accept_request", async (data) => {
    console.log(data);

    const request_doc = await FriendRequest.findById(data.request_id);
    console.log(request_doc);

    //requestID
    const sender = await User.findById(request_doc.sender);
    const reciever = await User.findById(request_doc.reciever);

    sender.friends.push(request_doc.reciever);
    reciever.friends.push(request_doc.sender);

    await reciever.save({ new: true, validateModifiedOly: true });
    await sender.save({ new: true, validateModifiedOly: true });

    await FriendRequest.findByIdAndDelete(data.request_id);

    socketioServer.to(sender?.socket_id).emit("request_accepted", {
      message: "Friend Request Accepted !",
    });
    socketioServer.to(reciever?.socket_id).emit("request_accepted", {
      message: "Friend Request Accepted !",
    });
  });

  scktio.on("get_direct_conversations", async ({ user_id }, callback) => {
    const existing_conversations = await directMsg
      .find({
        participants: { $all: [user_id] },
      })
      .populate("participants", "firstName lastName _id email status");
    console.log(existing_conversations);
    callback(existing_conversations);
  });

  scktio.on("start_conversation", async (data) => {
    const { to, from } = data;
    //checking if there is any exisiting convo between users
    const existing_conversations = await directMsg
      .find({
        participants: { $size: 2, $all: [to, from] },
      })
      .populate("participants", "firstName lastName _id email status");
    console.log(existing_conversations[0], "Existing Conversation");

    //if there is no existing conversation
    if (existing_conversations.length === 0) {
      let new_chat = await directMsg.create({
        participants: [to, from],
      });

      new_chat = await directMsg
        .findById(new_chat)
        .populate("participants", "firstName lastName _id email status");
      console.log(new_chat);
      scktio.emit("start_chat", new_chat);
    }

    //if there is existing conversation
    else {
      scktio.emit("start_chat", existing_conversations[0]);
    }
  });

  scktio.on("get_messages", async (data, callback) => {
    try {
      const { messages } = await directMsg
        .findById(data.conversation_id)
        .select("messages");
      callback(messages);
      console.log(messages, "this is calling");
    } catch (error) {
      console.log(error);
    }
  });

  //handle text and link messages
  //data contain sender, reciever and text message
  scktio.on("text_message", async (data) => {
    console.log("Message recieved !", data);

    const { message, conversation_id, from, to, type } = data;
    const to_user = await User.findById(to);
    const from_user = await User.findById(from);
    const new_message = {
      to: to,
      from: from,
      type: type,
      created_at: Date.now(),
      text: message,
    };
    //if convo doesn't exist between two users, create a new convo
    const chat = await directMsg.findById(conversation_id);
    chat.messages.push(new_message);
    console.log(new_message);
    //save to db
    await chat.save({ new: true, validateModifiedOnly: true });

    //emit incoming message to reciever
    socketioServer
      .to(to_user?.socket_id)
      .emit("new_message", { conversation_id, message: new_message });

    //emit outgoing message to sender
    socketioServer
      .to(from_user?.socket_id)
      .emit("new_message", { conversation_id, message: new_message });
  });

  scktio.on("file_message", (data) => {
    console.log("File message recieved !", data);

    //filedata contain sender, reciever, text and file

    const fileExtension = path.extname(data.file.name);

    //generate a unique filename
    const fileName = `${Date.now()}_${Math.floor(
      Math.random() * 10000
    )}${fileExtension}`;

    //upload file
    //if convo doesn't exist between two users, create a new convo

    //save to db

    //emit incoming message to reciever

    //emit outgoing message to sender
  });

  scktio.on("end", async (data) => {
    //find user by id and set status to offline
    if (data.user_id) {
      await User.findByIdAndUpdate(data.user_id, { status: "Offline" });
    }
    //broadcast user_disconnected

    console.log("Closing connection !");
    scktio.disconnect(0);
  });
});

process.on("unhandledRejection", (err) => {
  console.log(err);
  console.log("UNHANDLED REJECTION! Shutting down ...");
  httpserver.close(() => {
    process.exit(1); //  Exit Code 1 indicates that a container shut down, either because of an application failure.
  });
});
