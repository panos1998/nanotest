var express =require('express');
var user= require('../models/Users')
var async= require('async');
var {body,validationResult}= require('express-validator');
//Makes user authentication//
exports.auth= function(req,res,next){
    console.log("authenticated");
    next();
};
exports.adminauth=function(req,res,next){
    console.log("admin authenticated");
    next();
};

exports.gethomepagecontroller=function(req,res,next){
    res.render( 'Welcomepage' );
};
exports.getmenucontroller=function(req,res,next){
  res.render( 'index' ,{title:"Nanotypos",role:"admin"});
};

exports.getregisterformcontroller=function (req,res,next){
    res.render('Registerpage',{title:"Register"});
};
exports.postregistercontroller=[
    body('Name email password Phone','Don try to hack us :)').escape()
    ,async function(req,res,next){
        var errors= await validationResult(req);
        if(! errors.isEmpty()){
            res.render('Registerpage',{title:"Register",errors:errors.array()});
        }
        var User=  new user({
            Uname: req.body.name,
            email: req.body.email,
            hashed_password : req.body.password,
            phone: req.body.phone,
            role: "admin"

        });
        try{
            var  result= await user.exists({email:User.email})}
        catch(error){return next(error);}
        finally {
            if(result){res.render('Registerpage',{title:"Register",errors:"User with this email already exists, please try another",msg:body.message})}
            else( User.save((err  ) =>{
                    if (err){return next(err);}

                    else{ res.redirect('catalog')}})

            )
        }

    }];

exports.getloginformcontroller=function(req,res,next){
    res.render("Loginpage",{title:"Login"});
};
exports.postlogindatacontroller= function(req,res,next){
    res.send("login credits posted");
};

