const activityService = require("../services/activityService");
const scheduleService = require("../services/scheduleService");
const renderer = require("../core/renderer");

async function getActivities(request, response) {
    try {
        const activities = await activityService.getAllActivities();

        await renderer.renderPage(
            response,
            "activities",
            {
                
            }
        );

activities    } catch (error) {
        console.error(error);

        await renderer.renderPage(
            response,
            "error",
            {
                statusCode: 500,
                message: "Internal server error"
            },
            500
        );
    }
}

async function getActivityById(request, response, params) {
    try {
        const id = Number(params.id);

        if (!Number.isInteger(id) || id <= 0) {
            await renderer.renderPage(
                response,
                "error",
                {
                    statusCode: 400,
                    message: "Invalid activity ID"
                },
                400
            );

            return;
        }

        const activity = await activityService.getActivityById(id);

        if (!activity) {
            await renderer.renderPage(
                response,
                "error",
                {
                    statusCode: 404,
                    message: "Activity not found"
                },
                404
            );

            return;
        }

        await renderer.renderPage(
            response,
            "activity-detail",
            {
                activity
            }
        );

    } catch (error) {
        console.error(error);

        await renderer.renderPage(
            response,
            "error",
            {
                statusCode: 500,
                message: "Internal server error"
            },
            500
        );
    }
}

async function createActivity(request, response) {
    let body = "";

    request.on("data", (chunk) => {
        body += chunk;
    });

    request.on("end", async () => {
        try {
            const data = JSON.parse(body);

            const {
                name,
                base_price,
                max_capacity,
                age_category,
                association_id,
                facility_id,
                weekday,
                start_time,
                end_time,
                subzone
            } = data;

            if (
                !name ||
                base_price === undefined ||
                max_capacity === undefined ||
                !age_category ||
                association_id === undefined ||
                facility_id === undefined ||
                weekday === undefined ||
                !start_time ||
                !end_time
            ) {
                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 400,
                        message: "Missing required fields"
                    },
                    400
                );

                return;
            }

            if (
                typeof base_price !== "number" ||
                base_price < 0
            ) {
                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 400,
                        message:
                            "base_price must be a positive number or zero"
                    },
                    400
                );

                return;
            }

            if (
                !Number.isInteger(max_capacity) ||
                max_capacity <= 0
            ) {
                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 400,
                        message:
                            "max_capacity must be a positive integer"
                    },
                    400
                );

                return;
            }

            if (
                !Number.isInteger(association_id) ||
                association_id <= 0
            ) {
                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 400,
                        message: "Invalid association_id"
                    },
                    400
                );

                return;
            }

            if (
                !Number.isInteger(facility_id) ||
                facility_id <= 0
            ) {
                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 400,
                        message: "Invalid facility_id"
                    },
                    400
                );

                return;
            }

            if (
                !Number.isInteger(weekday) ||
                weekday < 1 ||
                weekday > 7
            ) {
                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 400,
                        message: "weekday must be between 1 and 7"
                    },
                    400
                );

                return;
            }

            if (start_time >= end_time) {
                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 400,
                        message:
                            "end_time must be greater than start_time"
                    },
                    400
                );

                return;
            }

            const capacityCheck =
                await scheduleService.checkFacilityCapacity(
                    facility_id,
                    max_capacity
                );

            if (!capacityCheck.valid) {
                if (
                    capacityCheck.reason === "facility_not_found"
                ) {
                    await renderer.renderPage(
                        response,
                        "error",
                        {
                            statusCode: 404,
                            message: "Facility not found"
                        },
                        404
                    );

                    return;
                }

                if (
                    capacityCheck.reason ===
                    "activity_capacity_exceeds_facility_capacity"
                ) {
                    await renderer.renderPage(
                        response,
                        "error",
                        {
                            statusCode: 400,
                            message:
                                "Activity capacity exceeds facility ERP capacity"
                        },
                        400
                    );

                    return;
                }
            }

            const collisions =
                await scheduleService.checkTimeCollision(
                    facility_id,
                    weekday,
                    start_time,
                    end_time,
                    subzone ?? null
                );

            if (collisions.length > 0) {
                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 409,
                        message: "Schedule collision"
                    },
                    409
                );

                return;
            }

            await activityService.createActivity(
                name,
                base_price,
                max_capacity,
                age_category,
                association_id,
                facility_id,
                weekday,
                start_time,
                end_time,
                subzone ?? null
            );

            response.writeHead(303, {
                Location: "/activities"
            });

            response.end();

        } catch (error) {
            console.error(error);

            await renderer.renderPage(
                response,
                "error",
                {
                    statusCode: 500,
                    message: "Internal server error"
                },
                500
            );
        }
    });
}

module.exports = {
    getActivities,
    getActivityById,
    createActivity
};