const router = require("express").Router();
const { User } = require("../models");
const { signToken, authMiddleware } = require("../utils/auth");

router.post("/", async (req, res) => {
  try {
    const userData = await User.create(req.body);
    const token = signToken(userData);
    res.status(201).json({ token, user: userData });
  } catch (err) {
    res.status(400).json({ message: "Could not create user.", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const userData = await User.findOne({ where: { email: req.body.email } });

    if (!userData) {
      return res.status(400).json({ message: "Incorrect email or password." });
    }

    const validPassword = userData.checkPassword(req.body.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Incorrect email or password." });
    }

    const token = signToken(userData);
    res.status(200).json({ token, user: userData });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong.", error: err.message });
  }
});

router.post("/logout", (req, res) => {
  res.status(204).end();
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong.", error: err.message });
  }
});

module.exports = router;
