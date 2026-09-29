const activityService = require("../services/activityService");
const scheduleService = require("../services/scheduleService");
const renderer = require("../core/renderer");
const { act } = require("react");


// ========================================
// GET /activities
// Display all activities
// ========================================

async function getActivities(request, response) {
    try {
        const activities =
            await activityService.getAllActivities();

        await renderer.renderPage(
            response,
            "activities",
            {
                activities
            }
        );

    } catch (error) {
        console.error(
            "Get activities error:",
            error
        );

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


// ========================================
// GET /activities/:id
// Display one activity
// ========================================


async function getActivityByIdJsonFormat(response,params) {
        const id = Number(params.id)

        try {
            const activity = await activityService.getActivityByIdJsonFormat(id)

        if(!activity){
            return JSON.stringify({
                "message": 'activity not found'
            })
        }

        return response.end(JSON.stringify(
            activity
        ))
            
        } catch (error) {
            return response.end(JSON.stringify({
                "message" : error
            }))
        }
   
}

async function getActivitiesWithStats(response) {
    const activities = await activityService.getActivitiesWithStats()

    await renderer.renderPage(
        response,
        "activities-stats",{
            activities
        }

    )


}

async function getActivityById(request, response, params) {
    try {
        const id = Number(params.id);

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
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


        const activity =
            await activityService.getActivityById(id);


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
        console.error(
            "Get activity error:",
            error
        );

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


// ========================================
// GET /activities/new
// Display create activity form
// ========================================

async function getCreateActivityPage(
    request,
    response
) {
    await renderer.renderPage(
        response,
        "activity-form",
        {
            editMode: false,
            activity: null
        }
    );
}


// ========================================
// GET /activities/:id/edit
// Display edit activity form
// ========================================

async function getCreateActivityPage(request, response) {
    try {
        const associations =
            await activityService.getAllAssociations();

        const facilities =
            await activityService.getAllFacilities();

        await renderer.renderPage(
            response,
            "activity-form",
            {
                editMode: false,
                activity: null,
                associations,
                facilities
            }
        );

    } catch (error) {
        console.error(
            "Get create activity page error:",
            error
        );

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

async function getEditActivityPage(
    request,
    response,
    params
) {
    try {
        const id = Number(params.id);

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
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

        const activity =
            await activityService.getActivityById(id);

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

        const associations =
            await activityService.getAllAssociations();

        const facilities =
            await activityService.getAllFacilities();

        await renderer.renderPage(
            response,
            "activity-form",
            {
                editMode: true,
                activity,
                associations,
                facilities
            }
        );

    } catch (error) {
        console.error(
            "Get edit activity page error:",
            error
        );

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


// ========================================
// POST /activities
// Create activity
// ========================================

async function createActivity(
    request,
    response
) {
    let body = "";


    request.on("data", (chunk) => {
        body += chunk;
    });


    request.on("end", async () => {
        try {

            const formData =
                new URLSearchParams(body);


            const name =
                formData.get("name");

            const basePrice =
                Number(
                    formData.get("base_price")
                );

            const maxCapacity =
                Number(
                    formData.get("max_capacity")
                );

            const ageCategory =
                formData.get("age_category");

            const associationId =
                Number(
                    formData.get("association_id")
                );

            const facilityId =
                Number(
                    formData.get("facility_id")
                );

            const weekday =
                Number(
                    formData.get("weekday")
                );

            const startTime =
                formData.get("start_time");

            const endTime =
                formData.get("end_time");

            const subzone =
                formData.get("subzone") || null;


            // ========================================
            // Basic validation
            // ========================================

            if (
                !name ||
                name.trim() === "" ||
                Number.isNaN(basePrice) ||
                !Number.isInteger(maxCapacity) ||
                !ageCategory ||
                !Number.isInteger(associationId) ||
                !Number.isInteger(facilityId) ||
                !Number.isInteger(weekday) ||
                !startTime ||
                !endTime
            ) {
                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 400,
                        message:
                            "Invalid activity data"
                    },
                    400
                );

                return;
            }


            // ========================================
            // Price validation
            // ========================================

            if (basePrice < 0) {
                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 400,
                        message:
                            "Base price cannot be negative"
                    },
                    400
                );

                return;
            }


            // ========================================
            // Capacity validation
            // ========================================

            if (maxCapacity <= 0) {
                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 400,
                        message:
                            "Maximum capacity must be greater than 0"
                    },
                    400
                );

                return;
            }


            // ========================================
            // Association / facility validation
            // ========================================

            if (
                associationId <= 0 ||
                facilityId <= 0
            ) {
                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 400,
                        message:
                            "Invalid association or facility"
                    },
                    400
                );

                return;
            }


            // ========================================
            // Weekday validation
            // 1 = Monday
            // 7 = Sunday
            // ========================================

            if (
                weekday < 1 ||
                weekday > 7
            ) {
                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 400,
                        message:
                            "Weekday must be between 1 and 7"
                    },
                    400
                );

                return;
            }


            // ========================================
            // Time validation
            // ========================================

            if (startTime >= endTime) {
                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 400,
                        message:
                            "End time must be greater than start time"
                    },
                    400
                );

                return;
            }


            // ========================================
            // Facility ERP capacity
            // ========================================

            const capacityCheck =
                await scheduleService.checkFacilityCapacity(
                    facilityId,
                    maxCapacity
                );


            if (!capacityCheck.valid) {

                if (
                    capacityCheck.reason ===
                    "facility_not_found"
                ) {
                    await renderer.renderPage(
                        response,
                        "error",
                        {
                            statusCode: 404,
                            message:
                                "Facility not found"
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


            // ========================================
            // Schedule collision
            // ========================================

            const collisions =
                await scheduleService.checkTimeCollision(
                    facilityId,
                    weekday,
                    startTime,
                    endTime,
                    subzone
                );


            if (collisions.length > 0) {
                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 409,
                        message:
                            "Schedule collision: another activity already occupies this time slot."
                    },
                    409
                );

                return;
            }


            // ========================================
            // Create activity
            // ========================================

            await activityService.createActivity(
                name.trim(),
                basePrice,
                maxCapacity,
                ageCategory,
                associationId,
                facilityId,
                weekday,
                startTime,
                endTime,
                subzone
            );


            // ========================================
            // Redirect
            // ========================================

            response.writeHead(303, {
                Location: "/activities"
            });

            response.end();

        } catch (error) {

            console.error(
                "Create activity error:",
                error
            );


            await renderer.renderPage(
                response,
                "error",
                {
                    statusCode: 500,
                    message:
                        "Unable to create activity"
                },
                500
            );
        }
    });
}


// ========================================
// POST /activities/:id/update
// Update activity
// ========================================

async function updateActivity(
    request,
    response,
    params
) {
    let body = "";


    request.on("data", (chunk) => {
        body += chunk;
    });


    request.on("end", async () => {
        try {

            const id =
                Number(params.id);


            // ========================================
            // ID validation
            // ========================================

            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {
                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 400,
                        message:
                            "Invalid activity ID"
                    },
                    400
                );

                return;
            }


            // ========================================
            // Check activity exists
            // ========================================

            const existingActivity =
                await activityService.getActivityById(
                    id
                );


            if (!existingActivity) {
                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 404,
                        message:
                            "Activity not found"
                    },
                    404
                );

                return;
            }


            // ========================================
            // Parse form
            // ========================================

            const formData =
                new URLSearchParams(body);


            const name =
                formData.get("name");

            const basePrice =
                Number(
                    formData.get("base_price")
                );

            const maxCapacity =
                Number(
                    formData.get("max_capacity")
                );

            const ageCategory =
                formData.get("age_category");

            const associationId =
                Number(
                    formData.get("association_id")
                );

            const facilityId =
                Number(
                    formData.get("facility_id")
                );

            const weekday =
                Number(
                    formData.get("weekday")
                );

            const startTime =
                formData.get("start_time");

            const endTime =
                formData.get("end_time");

            const subzone =
                formData.get("subzone") || null;


            // ========================================
            // Basic validation
            // ========================================

            if (
                !name ||
                name.trim() === "" ||
                Number.isNaN(basePrice) ||
                !Number.isInteger(maxCapacity) ||
                !ageCategory ||
                !Number.isInteger(associationId) ||
                !Number.isInteger(facilityId) ||
                !Number.isInteger(weekday) ||
                !startTime ||
                !endTime
            ) {
                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 400,
                        message:
                            "Invalid activity data"
                    },
                    400
                );

                return;
            }


            // ========================================
            // Price validation
            // ========================================

            if (basePrice < 0) {
                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 400,
                        message:
                            "Base price cannot be negative"
                    },
                    400
                );

                return;
            }


            // ========================================
            // Capacity validation
            // ========================================

            if (maxCapacity <= 0) {
                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 400,
                        message:
                            "Maximum capacity must be greater than 0"
                    },
                    400
                );

                return;
            }


            // ========================================
            // Association / facility validation
            // ========================================

            if (
                associationId <= 0 ||
                facilityId <= 0
            ) {
                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 400,
                        message:
                            "Invalid association or facility"
                    },
                    400
                );

                return;
            }


            // ========================================
            // Weekday validation
            // ========================================

            if (
                weekday < 1 ||
                weekday > 7
            ) {
                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 400,
                        message:
                            "Weekday must be between 1 and 7"
                    },
                    400
                );

                return;
            }


            // ========================================
            // Time validation
            // ========================================

            if (startTime >= endTime) {
                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 400,
                        message:
                            "End time must be greater than start time"
                    },
                    400
                );

                return;
            }


            // ========================================
            // Facility ERP capacity
            // ========================================

            const capacityCheck =
                await scheduleService.checkFacilityCapacity(
                    facilityId,
                    maxCapacity
                );


            if (!capacityCheck.valid) {

                if (
                    capacityCheck.reason ===
                    "facility_not_found"
                ) {
                    await renderer.renderPage(
                        response,
                        "error",
                        {
                            statusCode: 404,
                            message:
                                "Facility not found"
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


            // ========================================
            // Schedule collision
            //
            // IMPORTANT:
            // We need to ignore the current activity.
            // Otherwise the activity will collide with itself.
            // ========================================

            const collisions =
                await scheduleService.checkTimeCollision(
                    facilityId,
                    weekday,
                    startTime,
                    endTime,
                    subzone,
                    id
                );


            if (collisions.length > 0) {
                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 409,
                        message:
                            "Schedule collision: another activity already occupies this time slot."
                    },
                    409
                );

                return;
            }


            // ========================================
            // Update activity
            // ========================================

            await activityService.updateActivity(
                id,
                name.trim(),
                basePrice,
                maxCapacity,
                ageCategory,
                associationId,
                facilityId,
                weekday,
                startTime,
                endTime,
                subzone
            );


            // ========================================
            // Redirect
            // ========================================

            response.writeHead(303, {
                Location: `/activities/${id}`
            });

            response.end();

        } catch (error) {

            console.error(
                "Update activity error:",
                error
            );


            await renderer.renderPage(
                response,
                "error",
                {
                    statusCode: 500,
                    message:
                        "Unable to update activity"
                },
                500
            );
        }
    });
}


// ========================================
// POST /activities/:id/delete
// Delete activity
// ========================================

async function deleteActivity(
    request,
    response,
    params
) {
    try {

        const id =
            Number(params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
            await renderer.renderPage(
                response,
                "error",
                {
                    statusCode: 400,
                    message:
                        "Invalid activity ID"
                },
                400
            );

            return;
        }


        const activity =
            await activityService.deleteActivity(
                id
            );


        if (!activity) {
            await renderer.renderPage(
                response,
                "error",
                {
                    statusCode: 404,
                    message:
                        "Activity not found"
                },
                404
            );

            return;
        }


        response.writeHead(303, {
            Location: "/activities"
        });

        response.end();

    } catch (error) {

        console.error(
            "Delete activity error:",
            error
        );


        // Foreign key violation
        // means the activity is still
        // referenced by another table.

        if (error.code === "23503") {
            await renderer.renderPage(
                response,
                "error",
                {
                    statusCode: 409,
                    message:
                        "This activity cannot be deleted because it is still used by other records."
                },
                409
            );

            return;
        }


        await renderer.renderPage(
            response,
            "error",
            {
                statusCode: 500,
                message:
                    "Unable to delete activity"
            },
            500
        );
    }
}


module.exports = {
    getActivities,
    getActivityById,
    getCreateActivityPage,
    getEditActivityPage,
    createActivity,
    updateActivity,
    deleteActivity,
    getActivityByIdJsonFormat,
    getActivitiesWithStats
};