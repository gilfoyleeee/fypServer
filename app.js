//app created

const express = require("express"); //web framework for Nodejs
//to send the req and know the response from server
const morgan = require("morgan");

//express rate limit
const rateLimit = require("express-rate-limit")

//secure the app by setting various HTTP headers.
const helmet = require("helmet");

//sanitize the input data came from user
const mongoSanitize = require("express-mongo-sanitize");

const bodyParser = require("body-parser");

const XSS = require("xss");

const cors = require("cors");

const app = express();

app.use(express.urlencoded({
    extended: true,
}))

app.use(mongoSanitize());
// app.use(XSS());

app.use(cors({
    origin: "*",
    methods: ["GET", "PATCH", "POST", "DELETE", "PUT"],
    credentials: true, 
}));

app.use(express.json({ limit: "10kb"}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(helmet());

if (process.env.NODE_ENV === "development") {
app.use(morgan("dev"));
}

const limiter = rateLimit({
    max: 3000,
    windowMs: 60*60*1000, //one hour
    message: "Too many requests from this IP, Please try again later."
})
app.use("/chitchat", limiter)

module.exports = app;