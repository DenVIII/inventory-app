const db = require("../db/queries");

async function getCataloguePage(req, res) {
  const categories = await db.getAllCategories();
  const groceries = await db.getAllCatalogue();

  res.render("catalogue", { categories, groceries });
}

module.exports = {
  getCataloguePage,
};
