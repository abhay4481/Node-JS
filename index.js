import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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

const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const decoded = jwt.verify(token, "ifhiuswiuefhiuw");

    req.user = await User.findById(decoded._id);

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

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email });
  if (!user) return res.redirect("/register");

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    // alert("Incorrect Password");
    return res.redirect("/login");
  }

  const token = jwt.sign({ _id: user._id }, "ifhiuswiuefhiuw");

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});

app.get("/register", (req, res) => {
  res.render("reg");
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  // console.log(email);
  // console.log(password);

  const userExist = await User.findOne({ email });

  if (userExist) {
    return res.redirect("/login");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({ email, password: hashedPassword });

  const token = jwt.sign({ _id: user._id }, "ifhiuswiuefhiuw");

  res.cookie("token", token, {
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
