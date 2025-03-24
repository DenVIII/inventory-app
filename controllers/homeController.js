const db = require("../db/queries");

async function getHomePage(req, res) {
  res.render("index");
}

module.exports = {
  getHomePage,
};
