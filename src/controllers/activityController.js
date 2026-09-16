function getActivities(request, response) {
  response.writeHead(200, {
    "Content-Type": "application/json",
  });

  response.end(
    JSON.stringify({
      message: "List of activities",
    }),
  );
}

function getActivityById(request, response, params) {
  response.writeHead(200, {
    "Content-Type": "application/json",
  });

  response.end(
    JSON.stringify({
      message: "Activity found",
      id: params.id,
    }),
  );
}

module.exports = {
  getActivities,
  getActivityById,
};
