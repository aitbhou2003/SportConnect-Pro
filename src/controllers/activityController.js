const activityService = require("../services/activityService");

async function getActivities(request, response) {
    try {
        const activities = await activityService.getAllActivities();

        response.writeHead(200, {
            "Content-Type": "application/json"
        });

        response.end(JSON.stringify(activities));

    } catch (error) {
        console.error(error);

        response.writeHead(500, {
            "Content-Type": "application/json"
        });

        response.end(JSON.stringify({
            message: "Internal server error"
        }));
    }

}

async function getActivityById(request, response, params) {
    try {
        const id = Number(params.id);

        const activity = await activityService.getActivityById(id);

        if (!activity) {
            response.writeHead(404, {
                "Content-Type": "application/json"
            });

            response.end(JSON.stringify({
                message: "Activity not found"
            }));

            return;
        }

        response.writeHead(200, {
            "Content-Type": "application/json"
        });

        response.end(JSON.stringify(activity));

    } catch (error) {
        console.error(error);

        response.writeHead(500, {
            "Content-Type": "application/json"
        });

        response.end(JSON.stringify({
            message: "Internal server error"
        }));
    }

}

module.exports = {
    getActivities,
    getActivityById,
};
