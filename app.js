//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

console.log(process.env.API_KEY);


app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret:"This is our little secret.",
  resave : false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

// Database connection and schema creation

mongoose.connect("mongodb://localhost:27017/secret",{useNewUrlParser:true ,useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);
const userSchema =new mongoose.Schema({
  email :String,
  password : String
});
userSchema.plugin(passportLocalMongoose);
//encryption create it before mongoose model


const User = new  mongoose.model("User",userSchema);
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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
});

app.get("/secrets", function(req,res){
  if(req.isAuthenticated()){
     res.render("secrets");
  }else{
    res.redirect("/login");
  }
});

app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});


// handling post request

app.post("/register",function(req,res){
  User.register({username :req.body.username},req.body.password,function(err,user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req,res,function(){
        res.render("secrets");
      });
    }
  });

});

app.post("/login",function(req,res){
  const user = new User({
    username : req.body.username,
    password : req.body.password
  });
  req.login(user,function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      });
    }
  });
});





// server creation
app.listen(3000,function(){
  console.log("Server started at 3000");
})
