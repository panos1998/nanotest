var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ResourceSchema= new Schema({
    name: {type:String,required:true,maxlength:40},
    status: {type: String,enum:["Available","Maintenance"],default:"Available"},
    hourcost: {type:Number,required:true},
    photoURL: {type:String},
    maxBookingDays:{type:Number,default:10},
    dateInterval:{type:Number},
    reservation:[{
        BookingsID: {type: Schema.Types.ObjectId, ref: 'Books'},
        date_started: {type: Date},
        date_finished: {type: Date},

    }]
});
ResourceSchema
    .virtual('url')
    .get(function (){
        return '/resources/'+this._id+'/get';
    });
ResourceSchema
    .virtual('availability')
    .get(function (){
        return this.status;
    });
ResourceSchema
    .virtual('ph')
    .get(function (){
        return this.hourcost;
    });
ResourceSchema
    .virtual('photoLink')
    .get(function (){
        return this.photoURL;
    });
module.exports = mongoose.model('Resources', ResourceSchema);