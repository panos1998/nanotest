var booking= require('../models/Books');
var resource=require('../models/Resources');
var user=require('../models/Users');
var async= require('async');
var mongoose =require('mongoose');


exports.loadStats=  function (req,res,next){
    async.parallel({
        BooksperResource: function(callback) {
            resource.aggregate().project(
                {
                    "label": "$name",
                    y: {
                        $cond: {
                            if: {$isArray: "$reservation"},
                            then: {$size: "$reservation"},
                            else: 0
                        }
                    },
                    _id: 0

                }
            ).limit(10).exec(callback);
        },
        BooksperMonth:function (callback){ booking.aggregate().group({_id:{
                year:{$year:"$date_started"},
                month:{$month:"$date_started"}
            },

            count:{'$sum':1}
        }).sort({
            _id: 1
        }).exec(callback)

        },
        AverageTimePerResource:function (callback){
            booking.aggregate().lookup({
                'from': 'resources',
                'localField': 'resourceID',
                'foreignField': '_id',
                'as': 'resources'
            }).project({
                'label': '$resources.name',
                'duration': {
                    '$divide': [
                        {
                            '$subtract': [
                                '$date_finished', '$date_started'
                            ]
                        }, 3600000
                    ]
                }
            }).group({
                '_id': '$label',
                'avg': {
                    '$avg': '$duration'
                }}).project( {
                'label': '$_id',
                'y': '$avg',
                '_id': 0
            }).exec(callback)
        },
        AvgIncomePerResource:function (callback){
            booking.aggregate([
                {
                    '$lookup': {
                        'from': 'resources',
                        'localField': 'resourceID',
                        'foreignField': '_id',
                        'as': 'resources'
                    }
                }, {
                    '$group': {
                        '_id': '$resources.name',
                        'cost': {
                            '$avg': '$total_cost'
                        }
                    }
                }
            ]).exec(callback);
        }
    },function (error,result){
        if(error){return next(error);}
        else {
            res.send(JSON.parse(JSON.stringify(result)))

        }
    });



};
exports.displayStats= function (req,res,next){
    async.parallel({
        TotalUsers:function (callback){
            user.aggregate().count('Users').exec(callback)
        }
        ,TotalResources:function (callback){
            resource.aggregate().count('Resources').exec(callback)
        }
        ,TotalBookings:function (callback){
            booking.aggregate().count('Bookings').exec(callback)
        }
    },function (error,result){
        if(error){return next(error);}
        else{
            console.log(result.TotalUsers[0].Users)
            console.log(result.AverageTimePerResource)
            res.render('statsDash',{role:"admin",result:JSON.parse(JSON.stringify(result))});
        }
    })


};


