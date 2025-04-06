const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const override = require("method-override");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const AdminRouter = require("./routes/route-admins");
const UserRouter = require("./routes/route-users");
const AnnonceRouter = require("./routes/route-annonces");
const router = require("./routes/route");
const connectDB = require("./dataBase/connect");
const multer = require("multer");
const path = require("path");
const { name } = require("ejs");
require("dotenv").config();
const sendEmail = require("./middlewares/nodemailer"); // Importez la fonction sendEmail

const port = process.env.PORT || 3005;

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(override("_method"));
app.use(cookieParser());
app.use(
  session({
    secret: "votre_secret_unique",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: false,
      httpOnly: false,
    },
  })
);
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

connectDB();

app.use(AdminRouter);
app.use(UserRouter);
app.use(AnnonceRouter);
app.use(router);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});