import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

mongoose
  .connect("mongodb://127.0.0.1:27017", {
    dbName: "backEnd",
  })
  .then(() => console.log("DB Connected"))
  .catch((e) => console.log(e));

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model("Users", userSchema);

const app = express();

const isAuthenticated = (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    next();
  } else {
    res.render("login");
  }
};

app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

app.get("/", isAuthenticated, (req, res) => {
  res.render("logout");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email);
  console.log(password);
  const user = await User.create({ email, password });
  res.cookie("token", user._id, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});

app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
