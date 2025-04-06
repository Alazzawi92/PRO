module.exports = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.status(403).send("Vous n'êtes pas autorisé à accéder à cette page");
  }
};
