
const mongoose = require("mongoose");

const SchemaAnnonce = new mongoose.Schema({
  isApproved: {
    type: Boolean,
    default: false,
  },
  titreDeStage: {
    type: String,
    required: true,
    trim: true,
  },
  dureeDuStage: {
    type: String,
  },
  dateDeDebut: {
    type: String,
  },
  typeDeStage: {
    type: String,
    enum: ["Présentiel", "Télétravail", "Hybride"],
    required: true,
  },
  lieuDuStage: {
    type: String,
    required: true,
  },
  remuneration: {
    type: String,
  },
  domaine: {
    type: String,
    required: true,
  },
  niveau: {
    type: String,
    required: true,
  },
  competencesTechniques: {
    type: [String],
    required: true,
  },
  qualitesPersonnelles: {
    type: [String],
  },
  description: {
    type: String,
    required: true,
  },
  entreprise: {
    nom: { type: String, required: true },
    secteurActivite: { type: String, required: true },
    adresse: { type: String, required: true },
    codePostal: { type: String, required: true },
    ville: { type: String, required: true },
    siteWeb: { type: String },
    numeroTel: { type: String, required: true },
    email: { 
      type: String,
      required: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    numeroSiret: { type: String },
  },
  logo: { type: String },
  domaineImg: { type: String, required: true },

}, { timestamps: true });

const AnnonceModel = mongoose.model("Annonce", SchemaAnnonce);
module.exports = AnnonceModel;