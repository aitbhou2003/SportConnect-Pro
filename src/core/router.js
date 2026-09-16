const router = require("find-my-way")();

router.on("GET", "/", (request, response) => {
  response.end("Welcome to SportConnect-Pro");
});

router.on("GET", "/activities", (request, response) => {
  response.end("Activities");
});

router.on("GET", "/activities/:id", (request, response, params) => {
  response.end(`Activity ID: ${params.id}`);
});

router.on("POST", "/registrations", (request, response) => {
  let body = "";

  request.on("data", (chunk) => {
    body += chunk;
  });

  request.on("end", () => {
    try {
      const data = JSON.parse(body);

      console.log(data);
      console.log(data.memberId);
      console.log(data.activityId);

      response.writeHead(200, {
        "Content-Type": "application/json",
      });

      response.end(
        JSON.stringify({
          message: "Data received",
          data: data,
        }),
      );
    } catch (error) {
      response.writeHead(400, {
        "Content-Type": "application/json",
      });

      response.end(
        JSON.stringify({
          message: "Invalid JSON",
        }),
      );
    }
  });
});

module.exports = router;
