const router = require("find-my-way")();

const activityController = require("../controllers/activityController");
const memberController = require("../controllers/memberController");
const registrationController = require("../controllers/registrationController");

/*
 * Home
 */
router.on("GET", "/", (request, response) => {
  response.writeHead(200, {
    "Content-Type": "text/html; charset=UTF-8",
  });

  response.end(`
        <h1>SportConnect-Pro</h1>

        <nav>
            <a href="/activities">Activities</a>
            |
            <a href="/members">Members</a>
        </nav>
    `);
});

/*
 * Activities
 */
router.on("GET", "/activities", activityController.getActivities);

router.on("GET", "/activities/new", activityController.getCreateActivityPage);

router.on("GET","/activities/:id/edit",activityController.getEditActivityPage,);

router.on("GET", "/activities/:id", activityController.getActivityById);

router.on("POST", "/activities", activityController.createActivity);

router.on("POST", "/activities/:id/update", activityController.updateActivity);

router.on("POST", "/activities/:id/delete", activityController.deleteActivity);
/*
 * Members
 */

router.on("GET", "/members", memberController.getMembers);

router.on("GET", "/members/new", memberController.getCreateMemberPage);

router.on("GET", "/members/:id/edit", memberController.getEditMemberPage);

router.on("GET", "/members/:id", memberController.getMemberById);

router.on("POST", "/members", memberController.createMember);

router.on("POST", "/members/:id/update", memberController.updateMember);

router.on("POST", "/members/:id/delete", memberController.deleteMember);

/*
 * Registration
 */
router.on("GET", "/checkout/:id", registrationController.getCheckoutPage);

router.on("POST", "/registrations", registrationController.registerMember);

/*
 * Export the actual find-my-way router instance.
 */
module.exports = router;
