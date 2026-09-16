const http = require("http");

const router = require("./router");

const server = http.createServer((request, response) => {
    router.lookup(request, response);
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});