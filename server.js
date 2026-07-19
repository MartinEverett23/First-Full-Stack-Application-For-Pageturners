const express = require("express");
const path = require("path");

const sequelize = require("./config/connection");
const routes = require("./routes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3001;

const rebuild = process.argv[2] === "--rebuild";

app.use(express.static(path.join(__dirname, "public")));

app.use(routes);

sequelize.sync({ force: rebuild }).then(() => {
  app.listen(PORT, () => console.log(`Now listening on http://localhost:${PORT}`));
});
