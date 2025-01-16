const db = require("../db/queries");

async function getDeleteProductPage(req, res) {
  const id = parseInt(req.params.id);
  const grocery = await db.getGroceryDataById(id);

  if (!grocery) {
    const error = `Grocery with id:${id} Not Found`;
    console.log(new Error(error));
    res.status(404).send(error);
  }

  res.render("delete_product", { grocery: grocery[0] });
}

async function deleteProduct(req, res, next) {
  const grocery = {
    groceryId: req.body.product_id,
  };

  if (!grocery.groceryId) {
    res.status(400).redirect("/");
    console.log(new Error("Grocery not found"));
    return;
  }
  await db.deleteGroceryById(grocery.groceryId);

  res.status(201).redirect("/");
}

module.exports = {
  getDeleteProductPage,
  deleteProduct,
};
