require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./config/sequelize");
const port = 3000;

const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.options("*", cors());

const indexRouter = require("./routes/index");
const registerRouter = require("./routes/register");
const loginRouter = require("./routes/login");
const adminRouter = require("./routes/admin");
const filesRouter = require("./routes/myFiles");
const uploadRouter = require("./routes/upload");
const user = require("./routes/user");

app.use("/", indexRouter);
app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/admin", adminRouter);
app.use("/myFiles", filesRouter);
app.use("/uploads", uploadRouter);
app.use("/user", user);

sequelize.sync({ force: false }).then(() => {
  app.listen(port, () => {
    console.log("server is running on port ", port);
  });
});
