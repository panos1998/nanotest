var mongoose= require('mongoose');
var  Schema= mongoose.Schema;

var UserSchema= new Schema(
    {
        Uname: {type: String, required:true},
        email: {type:String,required:true},
        hashed_password:{type:String,required:true},
        role: {type: String,enum:["admin","user"],default:"user",required:true},
        phone:{type:String,required:true}}
);
UserSchema
    .virtual('url')
    .get(function(){
        return'/admin/users/'+this._id;
    });
UserSchema
.virtual("getRole")
.get(function(){
    return this.role;
});
module.exports = mongoose.model('Users', UserSchema);