const AnnonceModel = require("../Schema/SchemaAnnonces");

exports.addAnnoncesView = async (req, res) => {
  res.status(200).render("enterprises");
};

exports.addAnnonces = async (req, res) => {
  try {
    // Vérifier si un fichier a été uploadé
    if (!req.file) {
      return res.status(400).send("Erreur: L'image est obligatoire.");
    }

    const imageUrl = "uploads/" + req.file.filename;
    req.body.logo = imageUrl;

    console.log(imageUrl);

    // Détermine l'image du domaine
    const domaineImages = {
      informatique: "/img/informatique.jpg",
      ingenierie: "/img/ingenierie.jpg",
      sciences: "/img/sciences.jpg",
      sante: "/img/sante.jpg",
      droit: "/img/droit.jpg",
      economie: "/img/economie.jpg",
      commerce: "/img/commerce.jpg",
      education: "/img/education.jpg",
      arts: "/img/arts.jpg",
      lettres: "/img/lettres.jpg",
      social: "/img/social.jpg",
      agriculture: "/img/agriculture.jpg",
      autre: "/img/autre.jpg",
    };

    // Ajoute domaineImg à req.body
    req.body.domaineImg = domaineImages[req.body.domaine] || "";
    console.log("Domaine Image:", req.body.domaineImg);

    // Création et sauvegarde de l'annonce
    const newAnnonce = new AnnonceModel(req.body);
    await newAnnonce.save();

    res.status(200).redirect("/add-annonce");
  } catch (error) {
    console.error("Erreur serveur:", error.message);
    res.status(500).send("Erreur serveur: " + error.message);
  }
};


exports.annoncePage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      console.log("ID manquant !");
      return res.redirect(302, "/home");
    }

    const annonce = await AnnonceModel.findById(id);

    if (!annonce) {
      console.log("Annonce introuvable !");
      return res.redirect(302, "/home");
    }
    

    res.status(200).render("detailsDeStage", { annonce });
  } catch (error) {
    res.status(500).send("Server error: " + error.message);
  }
};

exports.searchAnnonces = async (req, res) => {
  const { titreDeStage, lieuDuStage } = req.body;
  console.log("Données reçues:", req.body);

  try {
    const annonces = await AnnonceModel.find({
      isApproved: true,
      titreDeStage: { $regex: new RegExp(titreDeStage, "i") },
      lieuDuStage: { $regex: new RegExp(lieuDuStage, "i") },
    });

    if (annonces.length === 0) {
      console.log("Aucun résultat trouvé !");
      return res.render("results", {
        annonces: [],
        message: "Aucune annonce trouvée.",
      });
    }

    console.log("Résultats trouvés:", annonces);
    res.render("results", { annonces });
  } catch (error) {
    console.error("Erreur serveur:", error.message);
    res.status(500).send("Erreur serveur: " + error.message);
  }
};

exports.searchAnnoncesView = async (req, res) => {
  res.status(200).render("results");
};

exports.annonceParVille = async (req, res) => {
  try {
    const { ville } = req.query; // Changer de req.params à req.query

    if (!ville) {
      return res
        .status(400)
        .json({ error: "Le paramètre 'ville' est requis." });
    }

    console.log("Données reçues:", req.query);

    const annonces = await AnnonceModel.find({
      lieuDuStage: { $regex: new RegExp(ville, "i") },
    });

    if (annonces.length === 0) {
      console.log("Aucun résultat trouvé !");
      return res.render("results", {
        annonces: [],
        message: "Aucune annonce trouvée pour cette ville.",
      });
    }

    console.log("Résultats trouvés:", annonces);
    res.render("results", { annonces });
  } catch (error) {
    console.error("Erreur serveur:", error);
    res.status(500).json({ error: "Erreur serveur: " + error.message });
  }
};

exports.approveAnnonce = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id", id);
    if (!id) {
      console.log("ID manquant !");
      return res.redirect(302, "/admin2");
    }
    const annonce = await AnnonceModel.findByIdAndUpdate(id, { isApproved: true });
    if (!annonce) {
      console.log("Annonce en attente introuvable !");
      return res.redirect(302, "/admin2");
    }
    res.redirect(302, "/admin2");
  } catch (error) {
    res.status(500).send("Erreur serveur: " + error.message);
  }
};

exports.rejectAnnonce = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      console.log("ID manquant !");
      return res.redirect(302, "/admin2");
    }

    await AnnonceModel.findByIdAndDelete(id);

    res.redirect(302, "/admin2");
  } catch (error) {
    res.status(500).send("Erreur serveur: " + error.message);
  }
};

exports.detailsAnnonceAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      console.log("ID manquant !");
      return res.redirect(302, "/admin2");
    } else {
      const annonce = await AnnonceModel.findById(id);
      res.status(200).render("detailsStageAdmin", { annonce });
    }
  } catch (error) {
    res.status(500).send("Erreur serveur: " + error.message);
  }
};