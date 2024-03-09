const mongoose = require("mongoose");

const frnReqSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    reciever: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    }
});

const FriendRequest = new mongoose.model("FriendRequest", frnReqSchema);
module.exports = FriendRequest;