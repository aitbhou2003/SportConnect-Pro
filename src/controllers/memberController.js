const memberService = require("../services/memberService");
const renderer = require("../core/renderer");

async function getMembers(request, response) {
  try {
    const members = await memberService.getAllMenmbers();

    await renderer.renderPage(response, "members", {
      members,
    });
  } catch (error) {
    console.error(error);

    await renderer.renderPage(
      response,
      "error",
      {
        statusCode: 500,
        message: "Internal server error",
      },
      500,
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
          message: "Invalid member ID",
        },
        400,
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
          message: "Member not found",
        },
        404,
      );

      return;
    }

    await renderer.renderPage(response, "member-detail", {
      member,
    });
  } catch (error) {
    console.error(error);

    await renderer.renderPage(
      response,
      "error",
      {
        statusCode: 500,
        message: "Internal server error",
      },
      500,
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
      const formData = new URLSearchParams(body);

      const name = formData.get("name");

      const birthDate = formData.get("birth_date");

      const resident = formData.get("resident") === "true";

      const qf = Number(formData.get("qf"));

      const medicalCertificateDate =
        formData.get("medical_certificate_date") || null;

      const familyIdValue = formData.get("family_id");

      const familyId = familyIdValue ? Number(familyIdValue) : null;

      if (
        !name ||
        name.trim() === "" ||
        !birthDate ||
        Number.isNaN(qf) ||
        qf < 0 ||
        (familyId !== null && (!Number.isInteger(familyId) || familyId <= 0))
      ) {
        await renderer.renderPage(
          response,
          "error",
          {
            statusCode: 400,
            message: "Invalid member data",
          },
          400,
        );

        return;
      }

      await memberService.createMember(
        name.trim(),
        birthDate,
        resident,
        qf,
        medicalCertificateDate,
        familyId,
      );

      response.writeHead(303, {
        Location: "/members",
      });

      response.end();
    } catch (error) {
      console.error(error);

      await renderer.renderPage(
        response,
        "error",
        {
          statusCode: 500,
          message: "Internal server error",
        },
        500,
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
        message: "Invalid member ID",
      },
      400,
    );

    return;
  }

  let body = "";

  request.on("data", (chunk) => {
    body += chunk;
  });

  request.on("end", async () => {
    try {
      const formData = new URLSearchParams(body);

      const name = formData.get("name");

      const birthDate = formData.get("birth_date");

      const resident = formData.get("resident") === "true";

      const qf = Number(formData.get("qf"));

      const medicalCertificateDate =
        formData.get("medical_certificate_date") || null;

      const familyIdValue = formData.get("family_id");

      const familyId = familyIdValue ? Number(familyIdValue) : null;

      if (
        !name ||
        name.trim() === "" ||
        !birthDate ||
        Number.isNaN(qf) ||
        qf < 0 ||
        (familyId !== null && (!Number.isInteger(familyId) || familyId <= 0))
      ) {
        await renderer.renderPage(
          response,
          "error",
          {
            statusCode: 400,
            message: "Invalid member data",
          },
          400,
        );

        return;
      }

      const member = await memberService.updateMember(
        id,
        name.trim(),
        birthDate,
        resident,
        qf,
        medicalCertificateDate,
        familyId,
      );

      if (!member) {
        await renderer.renderPage(
          response,
          "error",
          {
            statusCode: 404,
            message: "Member not found",
          },
          404,
        );

        return;
      }

      response.writeHead(303, {
        Location: `/members/${id}`,
      });

      response.end();
    } catch (error) {
      console.error(error);

      await renderer.renderPage(
        response,
        "error",
        {
          statusCode: 500,
          message: "Internal server error",
        },
        500,
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
          message: "Invalid member ID",
        },
        400,
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
          message: "Member not found",
        },
        404,
      );

      return;
    }

    response.writeHead(303, {
      Location: "/members",
    });

    response.end();
  } catch (error) {
    console.error(error);

    await renderer.renderPage(
      response,
      "error",
      {
        statusCode: 500,
        message: "Internal server error",
      },
      500,
    );
  }
}

async function getCreateMemberPage(request, response) {
  await renderer.renderPage(response, "member-form", {
    editMode: false,
    member: null,
  });
}

async function getEditMemberPage(request, response, params) {
  try {
    const id = Number(params.id);

    if (!Number.isInteger(id) || id <= 0) {
      await renderer.renderPage(
        response,
        "error",
        {
          statusCode: 400,
          message: "Invalid member ID",
        },
        400,
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
          message: "Member not found",
        },
        404,
      );

      return;
    }

    await renderer.renderPage(response, "member-form", {
      editMode: true,
      member,
    });
  } catch (error) {
    console.error(error);

    await renderer.renderPage(
      response,
      "error",
      {
        statusCode: 500,
        message: "Internal server error",
      },
      500,
    );
  }
}

module.exports = {
  getMembers,
  getMemberById,
  getCreateMemberPage,
  getEditMemberPage,
  createMember,
  updateMember,
  deleteMember,
};
