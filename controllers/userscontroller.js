var express = require('express');
var user = require('../models/Users');
var async= require('async');
var booking=require('../models/Books');
var mongoose=require('mongoose');
exports.getalluserscontroller= async function(req,res,next){
    let page=req.query.page;
    let records_per_page=10;
    try {
        var number_of_users= await user.find().count();}
    catch(err){
        return next(err);}
    try{
    var users=await user.find({},' _id Uname email phone role').sort({Uname:1}).skip((page-1)*records_per_page).limit(records_per_page);}
    catch (error) {
        return next(error);
    }
    finally {
        let total_pages= Math.ceil(number_of_users/records_per_page);
        console.log(total_pages);
        res.render('Userlist',{UserItem:users,role:req.userData.role,pages:total_pages,pg:page})
    }
};

exports.getuserBilling=async function(req,res,next){
    if(req.userData.id==req.params.id || req.userData.role=="admin") {
        try {
            var obj = await booking.aggregate().match({userID: mongoose.Types.ObjectId(req.params.id)}).group({
                _id: {
                    year: {$year: "$date_started"},
                    month: {$month: "$date_started"}
                },
                total_cost_month: {
                    $sum: "$total_cost"
                },
                bookings_month: {
                    $push: {
                        bookingID: "$_id",
                        date_started: "$date_started",
                        date_finished: "$date_finished",
                        total_cost: "$total_cost"
                    }
                }

            }).sort({_id: 1})

        } catch (error) {
            return next(error);
        } finally {
            console.log(obj)
            res.render('BookAccount', {object: obj, role: req.userData.role})
        }
    }
    else{
        res.redirect('/catalog');
    }
};