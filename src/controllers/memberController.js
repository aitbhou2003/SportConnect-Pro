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

module.exports = {
    getMembers,
    getMemberById   
}