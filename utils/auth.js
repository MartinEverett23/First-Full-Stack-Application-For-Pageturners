const jwt = require("jsonwebtoken");
require("dotenv").config();

const secret = process.env.JWT_SECRET || "pleasechangethissecret";
const expiration = "2h";

const authMiddleware = (req, res, next) => {
  let token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "You must be logged in to do that." });
  }

  token = token.split(" ").pop().trim();

  try {
    const { data } = jwt.verify(token, secret);
    req.user = data;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

const signToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
  };
  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
};

module.exports = { authMiddleware, signToken };
