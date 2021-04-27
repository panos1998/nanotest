var express =require('express');
var async= require('async');
var user= require('../models/Users');
var booking= require('../models/Books');
var resource=require('../models/Resources');
const { body,validationResult } = require("express-validator");
const { DateTime } = require("luxon");
var moment = require('moment-business-days');
var mongoose =require('mongoose');
exports.resourceslistcontroller= function(req,res,next){
    resource.find({},'name status hourcost')
        .exec(function (err,resources_found){
           if (err){
               return next(err);
           }
           res.render('resources_list',{title:"All resources listed below",resources_list:resources_found,role:req.userData.role});
        });
};

exports.resourcebyidcontroller= function(req,res,next){
    resource.findById(req.params.id,'name status hourcost photoURL maxBookingDays dateInterval')
        .exec(function (err,resource_found){
            if (err){
                return next(err);
            }
            res.render('resourcebyId_page',{resource_item:resource_found,role:req.userData.role});
        });

};

exports.resourcecreateformcontroller= function(req,res,next){
    res.render('addResourceform',{title:"Add a new resource",role:req.userData.role});
};

exports.resourcecreatepostcontroller=[
    body('name','Max length exceeted').isLength({max:40}).escape(),
    body('status').escape(),
    function(req,res,next){
    const errors=validationResult(req);
    var d=  new Date();
    console.log(req.body.costperhour);
    var resour= new resource({name:req.body.name,status:req.body.status,hourcost:req.body.costperhour,photoURL:req.body.photoURL,timestamp:d.getTime(),maxBookingDays:req.body.maxBooking,dateInterval:req.body.interval});
    console.log(resour.hourcost);
    if(!errors.isEmpty()){
        res.render('addResourceform',{title:"Add a new Resource",resource:resour,errors:errors.array(),role:req.userData.role});
        return;
    }
    else{
    resource.findOne({'name':req.body.name})
            .exec(function(err,found_resource){
              if (err)  {return next(err);}
              else if(found_resource){
                  let  Infomessage="Name already exists, please choose another";
                  resour.name="";
              res.render('addResourceform',{title:"Add a new Resource",message:Infomessage,resource:resour,role:req.userData.role});}
              else {
              resour.save(function (err) {
                if (err) { return next(err);}
                 res.redirect('/catalog'+resour.url)});}

    })

   }
  }
 ];

exports.resourcegetbookcontroller=function(req,res,next){
    resource.findById(req.params.id)
        .exec(function(err,found_resource){
            if(err){return next(err);}
            else  res.render('bookspecificresource_form',{resource_item:found_resource,role:req.userData.role});
        })

};
exports.postbookingcontroller=function(req,res,next){
        let timestampa=  Date.now();//+(3*3600000);
        let  time=new Date(timestampa);
        let date1= (req.body.date_started);
        let date3=new Date(""+date1+"");
        let  date2= req.body.date_finished;
        let date4=new Date(""+date2+"");
        let d= Date.now()-3600000;// booking registering timestamp
        let date= new Date(d);//  converted to date type
        async.parallel({
            book_found:   function (callback){resource.findOne({_id: req.params.id}).exec(callback)},
            exists_already:  function (callback){booking.findOne({$and: [{resourceID:mongoose.Types.ObjectId(req.params.id)},{$or:[{date_started:{ $gte:date3,$lte:date4}},{date_finished:{ $gte:date3,$lte:date4}}]}]}).exec(callback)},
            //returns true if user booked this resource  again since less than 1 hours
          booked_early:   function (callback){ booking.findOne({userID:mongoose.Types.ObjectId(req.body.userID),resourceID:mongoose.Types.ObjectId(req.params.id),timestamp:{$gte:date}}).exec(callback)}},
            function(err,results){
            if(err){return next(err);}
            else if(results.exists_already||results.booked_early){
                res.render('book failed',{title:"Sorry you are not allowed to make this booking please  try again later :)",role:req.userData.role});
               }
            else{ let d1=DateTime.fromISO(req.body.date_started).toISODate();
                let d2=DateTime.fromISO(req.body.date_finished).toISODate();
                let  workingdiff = moment(''+d1+'', 'YYYY-MM-DD').businessDiff(moment(''+d2+'','YYYY-MM-DD'));
                if(workingdiff>results.book_found.maxBookingDays){res.render('book failed',{title:"Booking date interval exceeds max",role:req.userData.role});}
                else {
                    if(date4.getDay()==0||date4.getDay()==6||date3.getDay()==0||date3.getDay()==6){
                          // res.redirect('/catalog/bookings');
                        res.render('bookspecificresource_form',{errors:"Please dont choose saturday or sunday as start/end booking dates",resource_item:results.book_found,role:req.userData.role},)
                        ;}
                    else{
                    let workingdiffToHours = workingdiff * 12 + date4.getHours()-date3.getHours();//(date4.getHours()-0) - (date3.getHours()-24);
                    console.log(workingdiffToHours);
                    console.log(workingdiff);
                    let totalcost = workingdiffToHours*results.book_found.ph;//results.resource_found.cost_per_day
                    var book = new booking({
                        userID: mongoose.Types.ObjectId(req.userData.id),
                        resourceID: mongoose.Types.ObjectId(req.params.id),
                        date_started: date3,
                        date_finished: date4,
                        total_cost: totalcost,
                        Project_title: req.body.Project_Title,
                        Project_desc: req.body.Project_Desc,
                        timestamp: time
                    });
                    async.waterfall([function (callback) {
                        book.save(err, function (err, booking_found) {
                            if (err) {
                                callback(err, null);
                                return;
                            }
                            var found_booking = booking_found;
                            callback(null, found_booking);
                        });
                    }
                        , function (found, callback) {
                            resource.updateOne({_id: found.resourceID}, {
                                $push: {
                                    reservation: {
                                        BookingsID: found._id,
                                        date_started: found.date_started,
                                        date_finished: found.date_finished
                                    }
                                }
                            }, err, function () {
                                if (err) {
                                    callback(err, null);
                                    return;
                                }

                                callback(null);
                            });}

                    ], function (err, result) {
                        if (err) {
                            res.send(err);
                        } else {
                            res.redirect('/catalog/bookings');
                        }
                    });
                }}}});}

exports.updateresourcegetcontroller= function(req,res,next){
    res.send("resource credits updated");
};

exports.updateresourcepostcontroller= function(req,res,next){
    res.send("resource  updated credits posted");
};

exports.deleteresourcepostcontroller=function (req,res,next){
    resource.findByIdAndDelete(mongoose.Types.ObjectId(req.params.id),{},function (err,book_found){
        if (err){
            return next(err);
        }
        else {res.send("resource deleted"+ book_found)}
    });
     //gets booking ids where specific  resource used and the ids of users made each book
     booking.find({resourceID:mongoose.Types.ObjectId(req.params.id)},'_id userID')
        .exec(function (err,book_found1){
            if(err){return next(err);}
            else{
                let book_found=JSON.parse(JSON.stringify(book_found1));//isos figi auti i grami//
                booking.deleteMany({_id:{$in:book_found1}})
                    .exec(function (err,number){
                        if (err){return next(err);}
                        else{console.log(number)
                        res.render('book failed',{title:"Resource Successfully delete",role:req.userData.role});}
                    });
                //delete bookings
            }
        })

};

exports.getcalendar=async function (req,res,next){
    res.render('calendar',{resourceID:mongoose.Types.ObjectId(JSON.parse(JSON.stringify(req.params.id))),role:req.userData.role});

};

exports.getresources=async function(req,res,next){
    try {
        var resourcedata=await resource.aggregate().project({
            'id': '$_id',
            'title':'$name',
            _id:0
        })
    }
    catch (error){
        return next(error)
    }
    finally {
        console.log(resourcedata)
        res.json(JSON.parse(JSON.stringify(resourcedata)))
    }
};