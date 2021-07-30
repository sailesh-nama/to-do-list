const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://sailesh_nama:Sailesh333@cluster0.stvvp.mongodb.net/todolistDB", { useNewUrlParser: true,useUnifiedTopology: true});

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your ToDoList !"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- check the box to remove a item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, fruits){
    if (fruits.length === 0 ){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log('Succesfully inserted default items');
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {title: "Personal To-Do-List", newlistitems: fruits});
    }
  });
});

app.post("/", function(req, res){
  const itemName = req.body.newitem;
  const listname = req.body.listname;

  const newItem = new Item({
    name: itemName
  });

  if(listname === "Personal To-Do-List"){
    newItem.save();
    console.log('Succesfully inserted in Personal To-Do-List');
    res.redirect("/");
  }
  else{
    List.findOne({name: listname}, function(err, foundlist){
      foundlist.items.push(newItem);
      foundlist.save();
      console.log('Succesfully inserted in '+ listname);
      res.redirect("/"+listname);
    });
  }
});

app.post("/delete", function(req, res){
  const chekedItemId = req.body.checkbox;
  const listname = req.body.listname;

  if(listname === "Personal To-Do-List"){
    Item.findByIdAndRemove(chekedItemId, function(err){
      if(!err){
        console.log("Succesfully deleted from Personal To-Do-List");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name: listname}, {$pull: {items: {_id: chekedItemId}}}, function(err, foundlist){
      if(!err){
        console.log("Succesfully deleted from "+listname);
        res.redirect("/"+listname);
      }
    });
    }
});

app.get("/:customListName", function(req, res){
  const customListName =  _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundlist){
    if(!err){
      if(!foundlist){
        //create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save(() => res.redirect('/' + customListName));
      }
      else{
        //show existing list
        res.render("list", {title: foundlist.name, newlistitems: foundlist.items})
      }
    }
  });
});

let port = process.env.PORT;
if(port == null || port ==""){
  port = 3000;
}

app.listen(port, function() {
  console.log("server started succesfully");
});

// mongo "mongodb+srv://cluster0.stvvp.mongodb.net/myFirstDatabase" --username sailesh_nama
