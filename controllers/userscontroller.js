var express = require('express');
var user = require('../models/Users');
var async= require('async');
exports.getalluserscontroller= async function(req,res,next){
    try{
    var users=await user.find({},' _id Uname email phone role').sort({Uname:1});}
    catch (error) {
        return next(error);
    }
    finally {
        res.render('Userlist',{UserItem:users,role:"admin"})
    }
};