const db = require("../db/queries");

async function getCataloguePage(req, res) {
  const categories = await db.getAllCategories();

  res.render("catalogue", { categories });
}

module.exports = {
  getCataloguePage,
};
