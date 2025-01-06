const { Router } = require("express");
const catalogueRouter = Router();
const catalogueController = require("../controllers/catalogueController");

catalogueRouter.get("/", catalogueController.getCataloguePage);

module.exports = catalogueRouter;
