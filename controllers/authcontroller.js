var express =require('express');
var user= require('../models/Users')
var async= require('async');
var {body,validationResult}= require('express-validator');
//const bcrypt=require('bcrypt');
const bcrypt= require('bcryptjs')
const jwt=require('jsonwebtoken')
//Makes user authentication//
exports.auth= async function (req,res,next){
    try{
        console.log('kefalides  '+req.headers.cookie)
        var kefalidesarray = req.headers.cookie.split(';')
        var oreo_biscuit =''
        kefalidesarray.forEach(biscuit =>{
            if (biscuit.startsWith(" JWT") || biscuit.startsWith("JWT")){
                oreo_biscuit = biscuit.split('=')[1]
                console.log(oreo_biscuit)
            }
        })
        const decoded=jwt.verify(oreo_biscuit,process.env.SECRET)
        req.userData=decoded;
        next();
    }catch (error){
        console.log("not auth");
        console.log(kefalidesarray)
        console.log(oreo_biscuit)
        //console.log("this is the header: "+ req.headers.cookie)
        //console.log("this is the token : "+ JWTcookie)
        res.redirect('/login')

    }

};
exports.adminauth=function(req,res,next){

    if(req.userData.role=="admin"){
        console.log("admin authenticated");
        next();
    }
    else {res.redirect('/');}
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
    , function(req,res,next){
        var errors=  validationResult(req);
        if(! errors.isEmpty()){
            res.render('Registerpage',{title:"Register",errors:errors.array()});
        }
        bcrypt.genSalt(10,(err,salt)=>{
                if(err){return next(err)}
                else {
                    bcrypt.hash(req.body.password,salt,function (err,hash){
                        if(err){return next(err)}
                        else{
                            var User=  new user({
                            Uname: req.body.name,
                            email: req.body.email,
                            hashed_password : hash,
                            phone: req.body.phone,
                            role: "user"
                        });
                            user.exists({email:User.email},function (err,obj){
                                    if(obj){
                                        res.render('Registerpage',{title:"Register",errors:"User with this email already exists, please try another",msg:body.message})
                                    }
                                    else( User.save((err  ) =>{
                                            if (err){return next(err);}
                                            else{ console.log(User) ;
                                                res.redirect('login')}
                                        })
                                    )
                                }
                            )}
                    })

                }
            }
        )
    }];

exports.getloginformcontroller=function(req,res,next){
    res.render("Loginpage",{title:"Login"});
};
exports.postlogindatacontroller= function(req,res,next){
    user.find({email:req.body.email})
        .exec()
        .then(User=>{
                if(User.length<1){
                    console.log("den iparxi o xristis")
                    res.render('Loginpage',{title:"Login",errors: "Failed to authenticate user"})
                }
                bcrypt.compare(req.body.password,User[0].hashed_password,(err,result)=>{
                    if (err){ console.log("lathos stin sigkrisi")
                        res.render('Loginpage',{title:"Login",errors: "Failed to authenticate user"})}
                    if (result){
                        const token=  jwt.sign({
                            id:User[0]._id,
                            role:User[0].role
                        },process.env.SECRET,{
                            expiresIn: "2h"
                        })


                        res.cookie('JWT',token,{
                            maxAge:7_200_000,
                            httpOnly:true,
                            secure:true,
                            sameSite:"strict"

                        }).redirect('/catalog');
                        console.log(token);

                        }

                        //console.log(token);
                    else{
                        console.log("kapoio lathos")
                        res.render('Loginpage',{title:"Login",errors: "Failed to authenticate user"})
                    }
                });
            }
        )
        .catch(err=>{
            return next(err)
        })
    // res.send("login credits posted");
};

exports.getlogoutcontroller=function (req,res,next){
    res.cookie('JWT',null)
    res.redirect('/');

}