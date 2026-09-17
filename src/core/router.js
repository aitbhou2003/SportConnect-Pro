const router = require("find-my-way")();
const activityController = require("../controllers/activityController");
const memberController = require("../controllers/memberController")

router.on("GET", "/", (request, response) => {
  response.end("Welcome to SportConnect-Pro");
});

router.on("GET", "/activities", activityController.getActivities);

router.on("GET", "/activities/:id", activityController.getActivityById);

router.on("GET","/members",memberController.getMembers);

router.on("GET","/members/:id",memberController.getMemberById)

module.exports = router;
