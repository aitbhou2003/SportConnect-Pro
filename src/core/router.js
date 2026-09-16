const router = require("find-my-way")();
const activityController = require("../controllers/activityController");

router.on("GET", "/", (request, response) => {
  response.end("Welcome to SportConnect-Pro");
});

router.on("GET", "/activities", activityController.getActivities);

router.on("GET", "/activities/:id", activityController.getActivityById);

module.exports = router;
