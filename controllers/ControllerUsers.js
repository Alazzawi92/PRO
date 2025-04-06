const UserModel = require("./../Schema/SchemaUsers");
const AnnonceModel = require("./../Schema/SchemaAnnonces");
const sendEmail = require("./../middlewares/nodemailer");
const postuler = require("./../middlewares/postuler");
const crypto = require("crypto");
exports.loginView = async (req, res) => {
  res.render("login");
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }
    req.session.user = {
      id: user._id,
      prenom: user.prenom,
      nom: user.nom,
    };
    // console.log("Session:", req.session.user);
    res.redirect(`/home`);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
exports.registerView = async (req, res) => {
  res.render("signup");
};
exports.register = async (req, res) => {
  const filePath = req.file.path;
  req.body.cv = filePath.replaceAll("\\", "/").split("/").splice(1).join("/");

  try {
    const newUser = new UserModel(req.body);
    const Usersaved = await newUser.save();
    res.status(200).redirect("login");
  } catch (error) {
    res.status(500).send("server error:" + error.message);
  }
};
exports.profileUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(401).send("Utilisateur non authentifié");
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    res.status(200).render("profileuser", { user });
  } catch (error) {
    res.status(500).send("Erreur serveur : " + error.message);
  }
};
exports.profileEditView = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send("Utilisateur non trouvé");
    } else {
      const userCV = user.cv;
      console.log("userCV", userCV);
      const userCVPath = userCV.split("/").splice(1).join("/");
      console.log("userCVPath", userCVPath);
      res.status(200).render("editprofile", { user });
    }
  } catch (error) {
    res.status(500).send("Erreur serveur : " + error.message);
  }
};
exports.profile = async (req, res) => {
  if (req.file) {
    const filePath = req.file.path;
    req.body.cv = filePath.replaceAll("\\", "/").split("/").splice(1).join("/");
  }
  const userId = req.session.user.id;
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(userId, req.body, {
      new: true,
      runValidators: true,
    });

    // Après la mise à jour réussie, rediriger l'utilisateur
    return res.status(200).redirect("/logout"); // Utilisation du `return` pour stopper l'exécution ici
  } catch (error) {
    console.error("Server Error:", error);

    // Vérifie si les en-têtes n'ont pas déjà été envoyés
    if (!res.headersSent) {
      return res
        .status(500)
        .send("Une erreur est survenue sur le serveur : " + error.message);
    }
  }
};
exports.forgotPasswordView = async (req, res) => {
  res.render("forgot-password");
};
exports.forgotPassword = async (req, res) => {
  try {
    // console.log("Requête reçue :", req.body);
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "L'e-mail est requis." });
    }
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // console.log("Utilisateur trouvé :", user);
    // console.log("Email à envoyer :", user.email);

    // Vérification avant d'envoyer l'e-mail
    if (!user.email) {
      console.error("Erreur : l'utilisateur n'a pas d'adresse e-mail !");
      return res
        .status(500)
        .json({ message: "L'utilisateur n'a pas d'adresse e-mail." });
    }

    // Génération du token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 heure d'expiration
    await user.save();

    console.log("Token brut envoyé par email :", resetToken);
    console.log("Token haché stocké en base :", hashedToken);

    // URL de réinitialisation
    const resetURL = `http://localhost:3005/reset-password/${resetToken}/?expires=${user.resetPasswordExpires}`;
    try {
      await sendEmail({
        to: user.email,
        subject: "Réinitialisation du mot de passe",
        text: `Cliquez ici pour réinitialiser votre mot de passe : ${resetURL}`,
        html: `<a href="${resetURL}">Cliquez ici pour réinitialiser votre mot de passe</a>`,
      });

      res.status(200).json({ message: "E-mail de réinitialisation envoyé." });
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'e-mail :", error.message);
      return res
        .status(500)
        .json({ message: "Erreur lors de l'envoi de l'e-mail." });
    }
  } catch (error) {
    console.error("Erreur interne :", error.message);
    res.status(500).json({ message: "Erreur serveur interne." });
  }
};
exports.resetPasswordView = async (req, res) => {
  try {
    // console.log("Requête reçue :", req.params);
    const expires = req.query.expires;
    const token = req.params.token;
    // console.log("Token reçu en paramètre :", { token, expires });
    res.render("reset-password", { token, expires }); // Vérifie que le fichier 'reset-password.ejs' existe
  } catch (error) {
    console.error("Erreur lors de l'affichage de la page :", error.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const { expires } = req.query;

    if (!password) {
      return res.status(400).json({ message: "Le mot de passe est requis." });
    }

    console.log("Token reçu en paramètre :", token);
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    console.log("Token haché pour la recherche :", hashedToken);

    const user = await UserModel.findOne({
      resetPasswordToken: hashedToken,
    });
    console.log("Utilisateur trouvé :", user);
    if (!user || user.resetPasswordExpires !== expires) {
      return res.status(400).json({ message: "Token invalide ou expiré" });
    }

    // Mise à jour du mot de passe et suppression du token
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la réinitialisation :", error.message);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
// exports.postuler = async (req, res) => {
//   try {
//     const annonceId = req.params.id;
//     const userId = req.session.user.id;

//     const user = await UserModel.findById(userId);
//     if (!user) {
//       return res.status(404).send("Utilisateur non trouvé");
//     }
//     const annonce = await AnnonceModel.findById(annonceId);
//     if (!annonce) {
//       return res.status(404).send("Annonce non trouvée");
//     }
//     // console.log("Annonce avant postulation :", annonce);
//     // console.log("Utilisateur avant postulation :", user);
//     const sent = await postuler({
//       to: annonce.entreprise.email,
//       subject: "Proposition de candidature pour un poste de préposé",
//       text: `Bonjour Madame/Monsieur,

// Nous avons actuellement un candidat correspondant à votre annonce sur la plateforme Stage Express pour un poste de préposé.

// Notre candidat, ${user.prenom} ${user.nom}, est très intéressé par l'opportunité que vous proposez. Nous vous prions de bien vouloir consulter son CV et de le contacter directement pour un entretien.

// Vous pouvez le joindre :
// 📧 Par email : ${user.email}
// 📞 Par téléphone : ${user.telephone}

// Nous restons à votre disposition pour toute information complémentaire. Vous trouverez en pièce jointe son CV ainsi que sa lettre de motivation.

// 📎 Lien du CV et de la lettre de motivation : Accéder au document

// Seriez-vous disponible pour échanger davantage et, si possible, organiser une rencontre ou un entretien ?

// Dans l’attente de votre retour, je vous remercie pour votre attention et reste à votre disposition.

// Cordialement,
// ${user.prenom} ${user.nom}
// 📞 ${user.telephone}
// 📧 ${user.email}
// `,
//       html: `<p>Bonjour Madame/Monsieur,</p>


// .`,
//       html: `<p>Vous avez postulé à l'annonce ${annonce.titre}. Vous serez contacté si votre candidature est retenue.</p>`,
//     });
//     console.log("Email envoyé :", sent);
//     res.status(200).redirect("/home");
//   } catch (error) {
//     res.status(500).send("Erreur serveur : " + error.message);
//   }
// };
exports.postuler = async (req, res) => {
  try {
    const annonceId = req.params.id;
    const userId = req.session.user.id;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    const annonce = await AnnonceModel.findById(annonceId);
    if (!annonce) {
      return res.status(404).send("Annonce non trouvée");
    }

    const cvUrl = `http://localhost:3005/${user.cv}`; // Assurez-vous que l'URL est correcte

    const sent = await postuler({
      to: annonce.entreprise.email,
      subject: "Proposition de candidature pour un poste de préposé",
      text: `Bonjour Madame/Monsieur,

Nous avons actuellement un candidat correspondant à votre annonce sur la plateforme Stage Express pour un poste de préposé.

Notre candidat, ${user.prenom} ${user.nom}, est très intéressé par l'opportunité que vous proposez. Nous vous prions de bien vouloir consulter son CV et de le contacter directement pour un entretien.

Vous pouvez le joindre :
📧 Par email : ${user.email}
📞 Par téléphone : ${user.telephone}

Nous restons à votre disposition pour toute information complémentaire. Vous trouverez en pièce jointe son CV ainsi que sa lettre de motivation.

📎 Lien du CV et de la lettre de motivation : ${cvUrl}

Seriez-vous disponible pour échanger davantage et, si possible, organiser une rencontre ou un entretien ?

Dans l’attente de votre retour, je vous remercie pour votre attention et reste à votre disposition.

Cordialement,
${user.prenom} ${user.nom}
📞 ${user.telephone}
📧 ${user.email}
`,

      html: `<p>Bonjour Madame/Monsieur,</p>
            <p>Nous avons actuellement un candidat correspondant à votre annonce sur la plateforme <strong>Stage Express</strong> pour un poste de <strong>préposé</strong>.</p>
            <p><strong>Notre candidat :</strong> ${user.prenom} ${user.nom}</p>
            <p>Il est très intéressé par cette opportunité et souhaiterait vous rencontrer.</p>
            <p>Vous pouvez le contacter directement :</p>
            <ul>
                <li><strong>Email :</strong> <a href="mailto:${user.email}">${user.email}</a></li>
                <li><strong>Téléphone :</strong> ${user.telephone}</li>
            </ul>
            <p>Vous trouverez en pièce jointe son CV ainsi que sa lettre de motivation.</p>
            <p>📎 <a href="${cvUrl}">Accéder au CV et à la lettre de motivation</a></p>
            <p>Seriez-vous disponible pour échanger davantage et, si possible, organiser une rencontre ou un entretien ?</p>
            <p>Dans l’attente de votre retour, je vous remercie pour votre attention et reste à votre disposition.</p>
            <p>Cordialement,<br>
            ${user.prenom} ${user.nom}<br>
            📞 ${user.telephone}<br>
            📧 <a href="mailto:${user.email}">${user.email}</a></p>`
    });

    console.log("Email envoyé :", sent);
    res.status(200).redirect("/home");
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);
    res.status(500).send("Erreur serveur : " + error.message);
  }
};
