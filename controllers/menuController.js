const db = require("../db/queries");

async function getHomePage(req, res) {
  const categories = await db.getAllCategories();

  res.render("index", { categories });
}

module.exports = {
  getHomePage,
};
