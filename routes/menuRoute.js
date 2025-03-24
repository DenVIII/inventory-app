const { Router } = require("express");
const menuRouter = Router();
const menuController = require("../controllers/menuController");

menuRouter.get("/", menuController.getHomePage);

module.exports = menuRouter;
