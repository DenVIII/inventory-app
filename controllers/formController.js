const db = require("../db/queries");

async function getFormPage(req, res) {
  res.render("form");
}

async function createNewGroceryCard(req, res, next) {
  const newGrocery = {
    name: req.body.name,
    quantity: 1 * req.body.quantity,
    measurment: req.body.measurment,
    priceRub: 1 * req.body.price_rub,
    categoryName: req.body.category_name,
    brandName: req.body.brand_name,
  };
  console.log(newGrocery);
  if (
    !newGrocery.name ||
    !newGrocery.quantity ||
    !newGrocery.measurment ||
    !newGrocery.priceRub ||
    !newGrocery.categoryName ||
    !newGrocery.brandName
  ) {
    res.status(400).redirect("/");
    console.log(new Error("All fields must be filled"));
    return;
  }
  await db.insertNewGrocery(newGrocery);

  res.status(201).redirect("/");
}

module.exports = {
  getFormPage,
  createNewGroceryCard,
};
