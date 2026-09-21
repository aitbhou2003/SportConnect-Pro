const router = require("find-my-way")();

const activityController = require("../controllers/activityController");
const memberController = require("../controllers/memberController");

router.on("GET", "/", activityController.getActivities);

router.on("GET", "/activities", activityController.getActivities);

router.on("GET", "/activities/:id", activityController.getActivityById);

router.on("GET", "/members", memberController.getMembers);

router.on("GET", "/members/:id", memberController.getMemberById);

router.on("POST", "/members", memberController.createMember);

router.on("PUT", "/members/:id", memberController.updateMember);

router.on("DELETE", "/members/:id", memberController.deleteMember);

router.on("POST", "/activities", activityController.createActivity);

module.exports = router;
