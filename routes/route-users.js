const express = require("express");
const router = express.Router();
const ControllerUsers = require("./../controllers/ControllerUsers");
const auth = require("./../middlewares/auth");
const uploads = require("./../middlewares/multer");
const uploadDoc=require("./../middlewares/multerDoc")
router.get("/login", ControllerUsers.loginView);
router.post("/login", ControllerUsers.login);
router.get("/register", ControllerUsers.registerView);
router.post("/register",uploadDoc.single("cv"), ControllerUsers.register);
router.get("/profile-user/:id", auth, ControllerUsers.profileUser);
router.get("/edit-profile/:id", auth, ControllerUsers.profileEditView);
router.patch("/profile", auth, uploadDoc.single("cv"), ControllerUsers.profile);
router.get("/forgot-password", ControllerUsers.forgotPasswordView);
router.post("/forgot-password", ControllerUsers.forgotPassword);
router.get("/reset-password/:token", ControllerUsers.resetPasswordView);
router.post("/submit-new-password/:token", ControllerUsers.resetPassword);
router.post("/postuler/:id", auth, ControllerUsers.postuler);

module.exports = router;
