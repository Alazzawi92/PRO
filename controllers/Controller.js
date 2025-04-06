const AnnonceModel = require("./../Schema/SchemaAnnonces");
const UserModel = require("./../Schema/SchemaUsers");
const axios = require("axios");

exports.home = async (req, res) => {
  try {
    const annonces = await AnnonceModel.find({isApproved:true}).sort({ createdAt: -1 });
    const annoncesParVille = {};

    annonces.forEach((annonce) => {
      const ville = annonce.lieuDuStage;
      if (!annoncesParVille[ville]) {
        annoncesParVille[ville] = [];
      }
      annoncesParVille[ville].push(annonce);
    });

    res.status(200).render("home-page", { annonces, annoncesParVille, users: null });
  } catch (error) {
    res.status(500).send("Server error: " + error.message);
  }
};
exports.homePage = async (req, res) => {
  try {
    const { id } = req.session;
    if (!id) {
      return res.redirect("/home"); 
    }
    const annonces = await AnnonceModel.find({isApproved:true}).sort({ createdAt: -1 });
    const annoncesParVille = {};

    annonces.forEach((annonce) => {
      const ville = annonce.entreprise.ville;
      if (!annoncesParVille[ville]) {
        annoncesParVille[ville] = [];
      }
      annoncesParVille[ville].push(annonce);
    });
console.log(user);

    res.status(200).render("home-page", { annonces, annoncesParVille, users: user });

  } catch (error) {
    res.status(500).send("Server error: " + error.message);
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
}

