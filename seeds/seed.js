const sequelize = require("../config/connection");
const { User, Post } = require("../models");
const postData = require("./posts.json");

const seedDatabase = async () => {
  await sequelize.sync({ force: true });

  const alice = await User.create({
    username: "alice",
    email: "alice@example.com",
    password: "password123",
  });

  const bob = await User.create({
    username: "bob",
    email: "bob@example.com",
    password: "password123",
  });

  const users = { alice, bob };

  for (const post of postData) {
    await Post.create({
      ...post,
      userId: users[post.postedBy].id,
    });
  }

  console.log("Database seeded! Sample logins:");
  console.log("  alice@example.com / password123");
  console.log("  bob@example.com / password123");

  process.exit(0);
};

seedDatabase();
