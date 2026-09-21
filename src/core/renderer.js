const ejs = require("ejs");

async function renderPage(response, view, data = {}, statusCode = 200) {
  try {
    const filePath = `views/pages/${view}.ejs`;

    const html = await ejs.renderFile(filePath, data);

    response.writeHead(statusCode, {
      "Content-Type": "text/html; charset=UTF-8",
    });

    response.end(html);
  } catch (error) {
    console.error("EJS rendering error:", error);

    response.writeHead(500, {
      "Content-Type": "text/plain; charset=UTF-8",
    });

    response.end("Internal server error");
  }
}

module.exports = {
  renderPage,
};
