const memberService = require("../services/memberService");

async function getMembers(request, response) {

    try {
        const members = await memberService.getAllMenmbers();

        response.writeHead(200, {
            "Content-Type": "application/json"
        })

        response.end(JSON.stringify(members))
    } catch (error) {
        console.error(error);
        response.writeHead(500, {
            "Content-Type": "application/json"

        })

        response.end(JSON.stringify({
            message: 'Internal server error'
        }))


    }
}


async function getMemberById(request, response, params) {
    try {
        const id = Number(params.id)

        if (!Number.isInteger(id) || id <= 0) {
            response.writeHead(400, {
                "Content-Type": "application/json"
            });

            response.end(JSON.stringify({
                message: "Invalide membre id"
            }))
        }

        const member = await memberService.getMemberById(id);
        if (!member) {
            response.writeHead(404, {
                "Content-Type": "application/json"
            });

            response.end(JSON.stringify({
                message: "membre not found"
            }));

            return

        }


        response.writeHead(200, {
            "Content-Type": "application/json"
        });

        response.end(JSON.stringify(member));

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


async function createMember(request, response) {

    let body = "";

    request.on("data", (chunk) => {
        body += chunk;
    });


    request.on("end", async () => {

        try {

            const data = JSON.parse(body);

            if (typeof data.name !== "string" ||
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
                response.writeHead(400, {
                    "Content-Type": "application/json"
                })

                response.end(JSON.stringify({
                    message: "invalide data"
                }));


                return


            }

            const member = await memberService.createMember(
                data.name,
                data.birth_date,
                data.resident,
                data.qf,
                data.medical_certificate_date,
                data.family_id
            );

            response.writeHead(201, {
                "Content-Type": "application/json"
            });

            response.end(JSON.stringify(member));

        } catch (error) {

            console.error(error);

            response.writeHead(500, {
                "Content-Type": "application/json"
            });

            response.end(JSON.stringify({
                message: "Internal server error"
            }));
        }
    });
}


async function updateMember(request, response, params) {
    const id = Number(params.id)

    if (!Number.isInteger(id) || id <= 0) {
        response.writeHead(400, {
            "Content-Type": "application/json"
        })

        response.end(JSON.stringify({
            message: "invalide id"
        }))

        return 
    }

    let body = ""

    request.on("data", (chunk) => {
        body += chunk
    })

    request.on("end", async () => {
        try {
            const data = JSON.parse(body)

            const member = await memberService.updateMember(
                id,
                data.name,
                data.birth_date,
                data.resident,
                data.qf,
                data.medical_certificate_date,
                data.family_id
            )

            if (!member) {
                response.writeHead(404, {
                    "Content-Type": "application/json"
                })

                response.end(JSON.stringify({
                    message: "member not found"
                }))

                return
            }

            response.writeHead(200, {
                "Content-Type": "application/json"
            });

            response.end(JSON.stringify(member));


        } catch (error) {
            console.error(error);

            response.writeHead(500, {
                "Content-Type": "application/json"
            });

            response.end(JSON.stringify({
                message: "Internal server error"
            }));

        }
    })
}




module.exports = {
    getMembers,
    getMemberById,
    createMember,
    updateMember
}