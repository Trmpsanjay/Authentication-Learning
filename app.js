//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();


app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Database connection and schema creation

mongoose.connect("mongodb://localhost:27017/secret",{useNewUrlParser:true});

const userSchema =new mongoose.Schema({
  email :String,
  password : String
});

//encryption create it before mongoose model
const secret = "Thisisourlittlesecret.";
userSchema.plugin(encrypt, { secret: secret , encryptedFields: ['password'] });

const User = mongoose.model("User",userSchema);

// Handling Get Routes
app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.get("/logout",function(req,res){
  res.redirect("/");
});

app.get("/submit",function(req,res){
  res.redirect("submit");
})


// handling post request

app.post("/register",function(req,res){
  const newUser = new User({
    email :req.body.username,
    password :req.body.password
  });
  newUser.save(function(err){
    if(err){
      console.log(err);
    }else{
      console.log(("succesfully created new user"));
      res.render("secrets");
    }
  });

});

app.post("/login",function(req,res){
  User.findOne(
    {email : req.body.username},
    function(err,foundUser){
      try{
        if(foundUser.password==null){
          res.send("User not registered kindly register");
        }
        else if(foundUser.password==req.body.password){
          console.log(foundUser.password);
          res.render("secrets");
        }
        else{
          res.send("Invalid Credadential");
        }
      }
      catch(err){
        console.log(err);
      }
    }
  );
});





// server creation
app.listen(3000,function(){
  console.log("Server started at 3000");
})
