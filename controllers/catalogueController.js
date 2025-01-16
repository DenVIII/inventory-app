const db = require("../db/queries");

async function getCataloguePage(req, res) {
  const categories = await db.getAllCategories();

  let groceries;
  if (Object.keys(req.query).length === 0) {
    groceries = await db.getAllCatalogue();
  } else {
    groceries = await db.getCatalogueBySearchQuery(req.query);
  }

  res.render("catalogue", { categories, groceries });
}

module.exports = {
  getCataloguePage,
};
