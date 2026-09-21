const memberService = require("../services/memberService");
const renderer = require("../core/renderer");

async function getMembers(request, response) {
    try {
        const members = await memberService.getAllMenmbers();

        await renderer.renderPage(
            response,
            "members",
            {
                members
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

async function getMemberById(request, response, params) {
    try {
        const id = Number(params.id);

        if (!Number.isInteger(id) || id <= 0) {
            await renderer.renderPage(
                response,
                "error",
                {
                    statusCode: 400,
                    message: "Invalid member ID"
                },
                400
            );

            return;
        }

        const member = await memberService.getMemberById(id);

        if (!member) {
            await renderer.renderPage(
                response,
                "error",
                {
                    statusCode: 404,
                    message: "Member not found"
                },
                404
            );

            return;
        }

        await renderer.renderPage(
            response,
            "member-detail",
            {
                member
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

async function createMember(request, response) {
    let body = "";

    request.on("data", (chunk) => {
        body += chunk;
    });

    request.on("end", async () => {
        try {
            const data = JSON.parse(body);

            if (
                typeof data.name !== "string" ||
                data.name.trim() === "" ||
                typeof data.birth_date !== "string" ||
                typeof data.resident !== "boolean" ||
                typeof data.qf !== "number" ||
                data.qf < 0 ||
                typeof data.medical_certificate_date !== "string" ||
                !data.medical_certificate_date ||
                !Number.isInteger(data.family_id) ||
                data.family_id <= 0
            ) {
                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 400,
                        message: "Invalid member data"
                    },
                    400
                );

                return;
            }

            await memberService.createMember(
                data.name,
                data.birth_date,
                data.resident,
                data.qf,
                data.medical_certificate_date,
                data.family_id
            );

            response.writeHead(303, {
                Location: "/members"
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

async function updateMember(request, response, params) {
    const id = Number(params.id);

    if (!Number.isInteger(id) || id <= 0) {
        await renderer.renderPage(
            response,
            "error",
            {
                statusCode: 400,
                message: "Invalid member ID"
            },
            400
        );

        return;
    }

    let body = "";

    request.on("data", (chunk) => {
        body += chunk;
    });

    request.on("end", async () => {
        try {
            const data = JSON.parse(body);

            const member = await memberService.updateMember(
                id,
                data.name,
                data.birth_date,
                data.resident,
                data.qf,
                data.medical_certificate_date,
                data.family_id
            );

            if (!member) {
                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 404,
                        message: "Member not found"
                    },
                    404
                );

                return;
            }

            response.writeHead(303, {
                Location: `/members/${id}`
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

async function deleteMember(request, response, params) {
    try {
        const id = Number(params.id);

        if (!Number.isInteger(id) || id <= 0) {
            await renderer.renderPage(
                response,
                "error",
                {
                    statusCode: 400,
                    message: "Invalid member ID"
                },
                400
            );

            return;
        }

        const member = await memberService.deleteMember(id);

        if (!member) {
            await renderer.renderPage(
                response,
                "error",
                {
                    statusCode: 404,
                    message: "Member not found"
                },
                404
            );

            return;
        }

        response.writeHead(303, {
            Location: "/members"
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
}

module.exports = {
    getMembers,
    getMemberById,
    createMember,
    updateMember,
    deleteMember
};