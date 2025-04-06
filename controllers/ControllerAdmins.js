const AdminModel = require("./../Schema/SchemaAdmin");
const AnnonceModel = require("../Schema/SchemaAnnonces");

exports.AdminView = async (req, res) => {
  res.render("admin1");
};
exports.addAdmin = async (req, res) => {
  try {
    const newAdmin = new AdminModel(req.body);
    const adminSaved = await newAdmin.save();

    res.status(200).redirect("/admins");
  } catch (error) {
    console.error("Erreur serveur:", error);
    res.status(500).send("Server error: " + error.message);
  }
};
exports.findOneAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin non trouvé" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }
    req.session.admin = {
      id: admin._id,
      prenom: admin.prenom,
      nom: admin.nom,
    };
    console.log("Session:", req.session.admin);
    res.redirect(`/admin2`);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
exports.AdminView2 = async (req, res) => {
  try {
    const adminId = req.session.admin.id;
    if (!adminId) {
      return res.status(401).send("Admin non authentifié");
    }
    const admin = await AdminModel.findById(adminId);
    if (!admin) {
      return res.status(404).send("Admin non trouvé");
    }
    const annoncesToValidate = await AnnonceModel.find({ isApproved: false });
    const annonces = await AnnonceModel.find({ isApproved: true });
    console.log(annoncesToValidate);
    res.status(200).render("admin2", { admin,annonces,annoncesToValidate });
  } catch (error) {
    res.status(500).send("Erreur serveur: " + error.message);
  }
};
exports.logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send("Erreur de déconnexion");
      }
      res.redirect("/home");
    });
  } catch (error) {
    res.status(500).send("Erreur serveur: " + error.message);
  }
};
