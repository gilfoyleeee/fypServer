// http server for our app created

const app = require("./app")

const http = require("http");

const server = http.createServer(app);

const port = process.env.PORT || 8000;

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});