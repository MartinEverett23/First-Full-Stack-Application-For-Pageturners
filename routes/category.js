const router = require("express").Router();
const { Post } = require("../models");

router.get("/", async (req, res) => {
  try {
    const posts = await Post.findAll({
      attributes: ["category"],
      group: ["category"],
    });

    const categories = posts.map((post) => post.category);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving categories.", error: err.message });
  }
});

module.exports = router;
