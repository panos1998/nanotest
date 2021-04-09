var mongoose = require('mongoose');
const { DateTime } = require("luxon");
var Schema = mongoose.Schema;
var BookingSchema= new Schema(
    {
        userID: {type: Schema.Types.ObjectId , ref:'Users'},
        date_finished:{type: Date},
        date_started: {type:Date},
        Project_title: {type:String},
        Project_desc: {type: String},
        total_cost: {type :Number},
        resourceID: {type: Schema.Types.ObjectId,ref:'Resources'},
        timestamp: {type:Date}

    }
);
BookingSchema
    .virtual('url')
    .get(function (){
        return '/bookings/'+this._id;
    });
BookingSchema
    .virtual("startdate")
    .get(function (){
        return DateTime.fromJSDate(this.date_started).setLocale('en-GB').toLocaleString(DateTime.DATETIME_SHORT);
    });
BookingSchema
    .virtual("finishdate")
    .get(function (){
        return DateTime.fromJSDate(this.date_finished).toLocaleString(DateTime.DATETIME_SHORT)
    });

BookingSchema
    .virtual("registertime")
    .get(function (){
        return DateTime.fromJSDate(this.timestamp).toLocaleString(DateTime.DATETIME_SHORT)
    });

module.exports = mongoose.model('Books', BookingSchema);
