//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

//connect to DB 
mongoose.connect('mongodb+srv://admin-sonu:Test123@cluster0-1zdlt.mongodb.net/todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
 
});
//useFindAndModify: false

//Create a Schema ....
const itemsSchema = {
  name: String
};

//create a new model with our schema
const Item = mongoose.model("Item", itemsSchema);

//Create model with Schema
const item1 = new Item({
  name: "welcome to your Tofo list"
});

const item2 = new Item({
  name: "hey now you connect your Todo with DataBase"
});

const item3 = new Item({
  name: "Now i learning the MongoDB"
});

const defaultitems = [item1, item2, item3];

//Create a new Schema ***
const listSchema = {
  name: String ,
  items : [itemsSchema]
};

const List = mongoose.model("List" , listSchema);



// Item.insertMany(defaultitems , (err)=>{
//   if(err){
//     console.log("There is error to adding");
//   }else {
//     console.log("successfully added .");
//   }
// })



app.get("/", function (req, res) {

  Item.find({}, (err, founditem) => {

    //If the founditem is empty then we use the defualt data 
    if (founditem.length === 0) {
      Item.insertMany(defaultitems, (err) => {
        if (err) {
          console.log("There is error to adding");
        } else {
          console.log("successfully added .");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: founditem });

    }
    // console.log(founditem);60706105
  });

});

app.get("/:list" , (req,res)=> {

    const customeListName = _.capitalize(req.params.list);
    console.log(customeListName);
  List.findOne({name: customeListName} ,(err, foundList)=> {
    if(!err) {
      if(!foundList) {
      //create a new lost        
      const list = new List({
          name: customeListName ,
           items : defaultitems
       });
   
       list.save();
      
       res.redirect("/"+ customeListName);
      }else {
        //show the existing list ..
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items })
      }
    }  
  });  
  
  
   

});


app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list
  ;

  item = new Item({
       name: itemName
  });
  //If the data come form "today" then we save the item and redirect to "/"
  if(listName === "Today") {
    item.save();

     res.redirect('/');
  }else {
    List.findOne({name: listName}, (err,foundlist)=>{
         foundlist.items.push(item);
         foundlist.save();
         res.redirect("/" + listName); 
    });
  };

   

  // ************************* 
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});


//post to delete router 
  app.post("/delete" , (req,res)=> {
      const checkedItemId = req.body.checkbox; 
      const listName = req.body.listName;
      
    
     console.log(listName);
    //Remove the item by chck in DB
    if(listName === "Today") {
      Item.findByIdAndRemove(checkedItemId , (err) => {
        if(err) {
          console.log('there is error in deleting');
        }else {
          console.log("successfully deleted the data");
        }
      });
    res.redirect('/');
    
  }else {
     List.findOneAndUpdate({name :listName},{$pull: {items: {_id: checkedItemId}}}, (err , foundlist)=>{
        if(!err) {
           res.redirect("/" + listName);
         }
     });
  }
    
   

  });





app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});




// let port = process.env.PORT;
// if (port == null || port == "") {
//   port = 3000;
// }
// app.listen(port);





//Server connections
app.listen(process.env.PORT||3000, function () {
  console.log("Server started on port 3000");
});
