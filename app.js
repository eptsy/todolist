const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const ejs = require("ejs");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

var username = encodeURIComponent("irfanshadikofficial");
var password = encodeURIComponent("Irfan#1087");
mongoose.connect(
  `mongodb+srv://${username}:${password}@cluster0.lwras38.mongodb.net/todolist`
);

const Schema = {
  name: String,
};
const List = mongoose.model("List", Schema);

const item1 = new List({
  name: "Welcome to todolist",
});
const item2 = new List({
  name: "Click the + button to add a new item.",
});
const item3 = new List({
  name: "<-- Hit this to delete an item.",
});

const Custom = mongoose.model("Custom", {
  name: String,
  items: [Schema],
});

const defaultTitle = "to-do-list";
app.get("/", (request, response) => {
  List.find({}).then((data) => {
    if (data == "") {
      List.insertMany([item1, item2, item3]).then(
        console.log("default items added")
      );
      response.render("home", { title: defaultTitle, todo: data });
    } else {
      response.render("home", { title: defaultTitle, todo: data });
    }
  });
});

// custom todolist
app.get("/:category", (req, res) => {
  let title = _.capitalize(req.params.category);
  const custom = new Custom({
    name: title,
    items: [item1, item2, item3],
  });
  Custom.findOne({ name: title }).then(async (data) => {
    if (data == null) {
      await custom.save();
      res.redirect("/" + title);
    } else {
      res.render("categories", { title: title, custom: data.items });
    }
    // if (data == "") {
    //   custom.save();
    //   res.render("categories", { title: title, custom: data.items });
    // } else {
    //   res.render("categories", { title: title, custom: data.items });
    // }
  });
});

app.post("/", (req, res) => {
  let item = req.body.item;
  let customList = req.body.list;
  const list = new List({
    name: item,
  });
  if (customList == undefined) {
    list.save();
    res.redirect("/");
  } else {
    Custom.findOne({ name: customList }).then((data) => {
      data.items.push(list);
      data.save();
      res.redirect("/" + customList);
    });
  }
});

app.post("/delete", async function (req, res) {
  const del = req.body.checkbox;
  const customListname = req.body.listname;
  if (customListname == undefined) {
    await List.findByIdAndRemove(del).then((data) => {
      console.log(del, "—removed");
    });
    res.redirect("/");
  } else {
    // if custom list
    await Custom.findOneAndUpdate(
      { name: customListname },
      { $pull: { items: { _id: del } } }
    ).then((data) => {
      console.log(del, "—removed");
    });
    res.redirect("/" + customListname);
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log("listening to 5000");
});
