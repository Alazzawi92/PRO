const express = require("express");
const router = express.Router();
const controllerAnnonces = require("./../controllers/ControllerAnnonces");
const upload = require("./../middlewares/multer");


router.get("/add-annonce", controllerAnnonces.addAnnoncesView);
router.post("/add-annonce",upload.single("logo"), controllerAnnonces.addAnnonces);
router.get("/voir-loffre/:id", controllerAnnonces.annoncePage);
router.get("/chercher-annonce", controllerAnnonces.searchAnnoncesView);
router.post("/chercher-annonce", controllerAnnonces.searchAnnonces);
router.get("/voirParVille", controllerAnnonces.annonceParVille);
router.post("/approve-annonce/:id", controllerAnnonces.approveAnnonce);
router.delete("/reject-annonce/:id", controllerAnnonces.rejectAnnonce);
router.get("/details-stage-admin/:id", controllerAnnonces.detailsAnnonceAdmin);

module.exports = router;