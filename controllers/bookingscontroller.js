var express =require('express');
var user= require('../models/Users');
var booking= require('../models/Books');
var resource=require('../models/Resources');
var async= require('async');
var mongoose =require('mongoose');

exports.getallbookscontroller= async function(req,res,next){
    try {//if req.session.role=admin filter all if req.session.role=user filter by user ID
        //var query={};
        //query.userID;
        //if (req.session.role=admin){query ={};}
        //else if (req.session.role=user){query[_id]=mongoose.Types.ObjectId(req.params.id);
        // query[userID]=mongoose.Types.ObjectId(bcrypt(req.session.id))
        var bookings_found= await booking.find().sort({timestamp:-1})
            .populate('userID','Uname phone -_id')
            .populate('resourceID','name')}
        catch(err){
        return next(err);}

        finally {res.render('all bookings',{book_list:bookings_found,role:"admin"});}
};

exports.getbookbyidcontroller= async function(req,res,next){
    //try{//if req.session.role=admin ok if req.session.role=user filter  by user id and booking id
      //  var booking_found=await booking.find({_id:})
    //}
    try {
        let query = {};
        query.userID
        query._id = mongoose.Types.ObjectId(req.params.id);
        var book_found=await booking.find(query,'date_finished date_started Project_title Project_desc total_cost timestamp')
            .populate('resourceID','name')
    } catch (error){
        return next(err);
    }
      finally {
        res.render('bookbyid',{book:book_found,role:"admin"});

    }

};

exports.bookgetupdateformcontroller= function(req,res,next){
    res.send("update form");
};

exports.bookupdatepostcontroller= function(req,res,next){
    console.log("booking credits updated");
};
//gets the books per resource only for admin
exports.bookbyresourcecontroller=async function (req,res,next){
    try {
        var result= await  booking.find({resourceID:mongoose.Types.ObjectId(req.params.resourceID)},
            'date_started date_finished timestamp total_cost')
            .populate('userID','Uname-_id').populate('resourceID','name -_id')
    }
    catch (error){
        return next(error);
    }
    finally {

        res.render('bookingsbyresource',{found:result,role:"admin"});
    }
};

exports.bookdeletepostcontroller=function (req,res,next){
    async.waterfall([function (callback){
        booking.findOneAndDelete({_id:mongoose.Types.ObjectId(req.params.id)},{projection:{resourceID:1}},function (err,booking_found){
            if (err){callback(err,null); return;}
            callback(null,booking_found)
        });
    },function (found,callback){
        console.log("this is resource id"+found.resourceID);
        resource.update({_id:found.resourceID},
            {$pull:{reservation:{BookingsID: mongoose.Types.ObjectId(req.params.id)}}},function (err){
                if (err) {
                    callback(err, null);
                    return;
                }
                console.log(found);
                callback(null);
            });
    }
    ], function (err,result){
        if (err){return next(err);}
        else {res.render('book failed',{title:"Book successfully deleted",role:"admin"});}
        }

    )
};

exports.getbookings= async function  (req,res,next){
    try {
        var bookdata= await booking.aggregate().project({
            'title': '$Project_title',
            'resourceId':'$resourceID',
            'start': '$date_started',
            'end': '$date_finished',
            _id:0
        })
    }
    catch (error){
        return next(error);
    }
    finally {
        console.log(bookdata)
        res.json(JSON.parse(JSON.stringify(bookdata)))
    }
};
