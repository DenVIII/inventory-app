const { Router } = require("express");
const productRouter = Router();
const productController = require("../controllers/productController");

productRouter.get("/:id", productController.getProductPage);
productRouter.post("/", productController.updateProduct);

module.exports = productRouter;
