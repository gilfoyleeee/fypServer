// http server for our app created

const app = require("./app");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({path: "./config.env"});

process.on("uncaughtException", (err) => {
  console.log(err);
  process.exit(1);
});

const http = require("http");

const server = http.createServer(app);

const DB = process.env.DB_url.replace("<password>", process.env.DB_pw);

mongoose.connect(DB, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    useUnifiedTopology: true,
}).then((con) => {
    console.log("MongoDB sucessfully connected !")
}).catch((err) => {
    console.log(err);
});

const port = process.env.PORT || 8000;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
