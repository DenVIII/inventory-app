const db = require("../db/queries");

async function getProductPage(req, res) {
  const id = parseInt(req.params.id);
  const grocery = await db.getGroceryDataById(id);

  if (!grocery) {
    const error = `Grocery with id:${id} Not Found`;
    console.log(new Error(error));
    res.status(404).send(error);
  }

  res.render("update_product", { grocery: grocery[0] });
}

async function updateProduct(req, res, next) {
  const updatedGrocery = {
    groceryId: req.body.product_id,
    name: req.body.name,
    quantity: 1 * req.body.quantity,
    measurment: req.body.measurment,
    priceRub: 1 * req.body.price_rub,
    categoryName: req.body.category_name,
    brandName: req.body.brand_name,
  };

  if (
    !updatedGrocery.groceryId ||
    !updatedGrocery.name ||
    !updatedGrocery.quantity ||
    !updatedGrocery.measurment ||
    !updatedGrocery.priceRub ||
    !updatedGrocery.categoryName ||
    !updatedGrocery.brandName
  ) {
    res.status(400).redirect("/");
    console.log(new Error("All fields must be filled"));
    return;
  }
  await db.updateGrocery(updatedGrocery);

  res.status(201).redirect("/");
}

module.exports = {
  getProductPage,
  updateProduct,
};
