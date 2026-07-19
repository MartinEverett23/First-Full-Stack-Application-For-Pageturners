const router = require("express").Router();
const { Post } = require("../models");
const { authMiddleware } = require("../utils/auth");

router.get("/", async (req, res) => {
  try {
    const where = {};
    if (req.query.category && req.query.category !== "all") {
      where.category = req.query.category;
    }

    const posts = await Post.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving posts.", error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving post.", error: err.message });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, bookAuthor, category, body, rating } = req.body;

    const post = await Post.create({
      title,
      bookAuthor,
      category,
      body,
      rating,
      postedBy: req.user.username,
      userId: req.user.id,
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "Error creating post.", error: err.message });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your own posts." });
    }

    const { title, bookAuthor, category, body, rating } = req.body;
    await post.update({ title, bookAuthor, category, body, rating });

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Error updating post.", error: err.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own posts." });
    }

    await post.destroy();
    res.json({ message: "Post deleted." });
  } catch (err) {
    res.status(500).json({ message: "Error deleting post.", error: err.message });
  }
});

module.exports = router;
