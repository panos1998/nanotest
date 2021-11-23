var express =require('express');
var user= require('../models/Users');
var booking= require('../models/Books');
var resource=require('../models/Resources');
var async= require('async');
var mongoose =require('mongoose');

exports.getallbookscontroller= async function(req,res,next){
    let pg=req.query.page
    let records_per_page=50;
    var query={};
    if(req.userData.role=="user"){
        query.userID=req.userData.id;}
    else if (req.userData.role=="admin"){query ={};}
    try {
        var number_of_bookings= await booking.find(query).count()}
    catch(err){
        return next(err);}
    try {
        var bookings_found= await booking.find(query).skip((pg-1)*records_per_page).sort({timestamp:-1})
            .populate('userID','Uname phone -_id')
            .populate('resourceID','name').limit(records_per_page)}
    catch(err){
        return next(err);}

    finally {
        //console.log(query);
        //console.log(number_of_bookings)
        let total_pages=Math.ceil(number_of_bookings/records_per_page)
        res.render('all bookings',{book_list:bookings_found,role:req.userData.role,number:pg,pages:total_pages/*nonceHash:res.locals.cspNonce*/});}
};

exports.getbookbyidcontroller= async function(req,res,next){
    //try{//if req.session.role=admin ok if req.session.role=user filter  by user id and booking id
      //  var booking_found=await booking.find({_id:})
    //}
    if(req.userData.role=="admin"){
        var  query = {};
        query.userID
        query._id = mongoose.Types.ObjectId(req.params.id);
    }
    else{
        var query={};
        query.userID=mongoose.Types.ObjectId(req.userData.id);
        query._id=mongoose.Types.ObjectId(req.params.id);
    }
    try {

        var book_found=await booking.find(query,'date_finished date_started Project_title Project_desc total_cost timestamp')
            .populate('resourceID','name')
    } catch (error){
        return next(err);
    }
      finally {
        res.render('bookbyid',{book:book_found,role:req.userData.role});

    }

};

exports.bookgetupdateformcontroller=async  function(req,res,next){
    if(req.userData.role=="admin"){
        var  query = {};
        query.userID
        query._id = mongoose.Types.ObjectId(req.params.id);
    }
    else{
        var query={};
        query.userID=mongoose.Types.ObjectId(req.userData.id);
        query._id=mongoose.Types.ObjectId(req.params.id);
    }
    try {
        var book_found=await booking.find(query,'date_finished date_started Project_title Project_desc total_cost timestamp')
            .populate('resourceID','name')
    } catch (error){
        return next(err);
    }
    res.render('update form',{book:book_found,role:req.userData.role});
};

exports.bookupdatepostcontroller= async function(req,res,next){
    mongoose.set('useFindAndModify', false);
    if(req.userData.role=="admin"){
        var  query = {};
        query.userID
        query._id = mongoose.Types.ObjectId(req.params.id);
    }
    else{
        var query={};
        query.userID=mongoose.Types.ObjectId(req.userData.id);
        query._id=mongoose.Types.ObjectId(req.params.id);
    }
    try {
        var book_found=await booking.findOneAndUpdate(query,{Project_title:req.body.Project_Title,Project_desc:req.body.Project_Desc})
            .populate('resourceID','name')
    } catch (error){
        return next(err);
    }
    res.redirect('/catalog/bookings/'+book_found._id+'/get');
    //console.log("booking credits updated");
};
//gets the books per resource only for admin
exports.bookbyresourcecontroller=async function (req,res,next){
    let page=req.query.page;
    let records_per_page=50;
    try{
        var bookings_count=await booking.find({resourceID:mongoose.Types.ObjectId(req.params.resourceID)}).count()
    }catch (error){
        return next(error)
    }
    try {
        var result= await  booking.find({resourceID:mongoose.Types.ObjectId(req.params.resourceID)},
            'date_started date_finished timestamp total_cost')
            .populate('userID','Uname-_id').populate('resourceID','name -_id').skip((page-1)*records_per_page).limit(records_per_page)
    }
    catch (error){
        return next(error);
    }
    finally {
        let total_pages= Math.ceil(bookings_count/records_per_page);
        res.render('bookingsbyresource',{found:result,role:req.userData.role,pages:total_pages,pg:page});
    }
};

exports.bookdeletepostcontroller=function (req,res,next){
    if(req.userData.role=="admin"){
        var  query = {};
        query.userID
        query._id = mongoose.Types.ObjectId(req.params.id);

    }
    else{
        var query={};
        query.userID=mongoose.Types.ObjectId(req.userData.id);
        query._id=mongoose.Types.ObjectId(req.params.id);
        query.date_started={$gte:Date.now()+3600000}
    }
    async.waterfall([function (callback){
        booking.findOneAndDelete(query,{projection:{resourceID:1}},function (err,booking_found){
            if (err){callback(err,null); return;}
            //console.log(booking_found);
            callback(null,booking_found)

        });
    },function (found,callback){
       // console.log("this is resource id"+found.resourceID);
        if (found!=null){
        resource.update({_id:found.resourceID},
            {$pull:{reservation:{BookingsID: mongoose.Types.ObjectId(req.params.id)}}},function (err){
                if (err) {
                    callback(err, null);
                    return;
                }
                console.log(found);
                callback(null);
            });}
        else callback(null,"unsuccessfull");
    }
    ], function (err,result){
        if (err){return next(err);}
        else if(result=="unsuccessfull"){res.render('book failed',{title:"Book did not delete",role:req.userData.role});}
        else {res.render('book failed',{title:"Book successfully deleted",role:req.userData.role});}
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
        //console.log(bookdata)
        res.json(JSON.parse(JSON.stringify(bookdata)))
    }
};


