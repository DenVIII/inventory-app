const { Router } = require("express");
const deleteProductPageRouter = Router();
const deleteProductPageController = require("../controllers/deleteProductPageController");

deleteProductPageRouter.get(
  "/:id",
  deleteProductPageController.getDeleteProductPage
);
deleteProductPageRouter.post("/", deleteProductPageController.deleteProduct);

module.exports = deleteProductPageRouter;
