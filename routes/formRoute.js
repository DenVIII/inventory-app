const { Router } = require("express");
const formRouter = Router();
const formController = require("../controllers/formController");

formRouter.get("/", formController.getFormPage);

module.exports = formRouter;
