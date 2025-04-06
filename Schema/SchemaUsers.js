const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const SchemaUser = new mongoose.Schema(
  {
    nom: { type: String },
    prenom: { type: String },
    addressPostal: { type: String },
    codePostal: { type: Number },
    ville: { type: String },
    email: { type: String , unique: true , required: true},
    password: { type: String },
    confirmPassword: { type: String },
    telephone: { type: String },
    domaineEtudes: { type: String },
    niveauEtude: { type: String },
    etablissement: { type: String },
    year: { type: String },
    cv: { type: String },
    lettreMotivation: { type: String }, 
    resetPasswordToken: String,
    resetPasswordexpires: Date,
  },
  { timestamps: true }
);
SchemaUser.methods.generateResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordexpires = Date.now() + 60 * 60 * 1000; // just il rest 60 minutes
  return resetToken;
};
SchemaUser.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
SchemaUser.pre("save", async function (next) {
  if (this.isModified("confirmPassword")) {
    this.confirmPassword = await bcrypt.hash(this.confirmPassword, 10);
  }
  next();
});
SchemaUser.pre("findOneAndUpdate", async function (next) {
  if (this._update.password) {
    this._update.password = await bcrypt.hash(this._update.password, 10);
  }
  next();
});
SchemaUser.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.model("User", SchemaUser);

module.exports = UserModel;
