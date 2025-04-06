const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const SchemaAdmin = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  },
  password: {
    type: String,
  },
});
SchemaAdmin.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
  SchemaAdmin.pre("findOneAndUpdate", async function (next) {
    if (this._update.password) {
      this._update.password = await bcrypt.hash(this._update.password, 10);
    }
    next();
  });

});
SchemaAdmin.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
AdminModel = mongoose.model("Admin", SchemaAdmin);
module.exports = AdminModel;
