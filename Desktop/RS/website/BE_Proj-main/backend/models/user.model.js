import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    fullname: 
    {
        type : String,
        required : true
    },
    phoneNumber:
    {
        type : Number,
        required : true,
        unique : true
    },
    email:
    {
        type : String,
        required : true,
        unique : true
    },
    password:
    {
        type : String,
        required : true
    },
    address:
    {
        type : String,
        //required : true
    },
    city:
    {
        type : String,
        //required : true
    },
    pincode:
    {
        type : Number,
        //required : true
    },
    profilePhoto:{
        type : String,
        default:""
    }
    
},{timestamps:true});
export const User = mongoose.model('User',userSchema);