const router = require("express").Router();

const postRoutes = require("./post");
const userRoutes = require("./user");
const categoryRoutes = require("./category");

router.get("/api", (req, res) => {
  res.json({ message: "Welcome to the PageTurner API" });
});

router.use("/api/posts", postRoutes);
router.use("/api/users", userRoutes);
router.use("/api/categories", categoryRoutes);

module.exports = router;
