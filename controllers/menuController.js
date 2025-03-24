const db = require("../db/queries");

async function getMenuPage(req, res) {
  const categories = await db.getAllCategories();

  res.render("menu", { categories });
}

module.exports = {
  getMenuPage,
};
