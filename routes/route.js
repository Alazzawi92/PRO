const express = require("express");
const router = express.Router();
const ControllerUsers = require("./../controllers/ControllerUsers");
const ControllerAnnonces = require("./../controllers/ControllerAnnonces");
const controller = require("./../controllers/Controller");
router.get("/home", controller.home);
router.get("/logout", controller.logout);


module.exports=router;