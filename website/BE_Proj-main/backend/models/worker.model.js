import mongoose from "mongoose";

const workerSchema = new mongoose.Schema({
    fullname:
    {
        type : String,
        required : true
    },
    phoneNumber:
    {
        type : Number,
        required : true
    },
    password:
    {
        type : String,
        required : true
    },
    skills:  // Cooking, maid, etc.
    {
        type : String,
        required : true
    },
    address:
    {
        type : String,
        required : true
    },
    city:
    {
        type : String,
        required : true
    },
    pincode:
    {
        type : Number,
        required : true
    },
    avaliability: //Full-time, part-time, on-demand
    {
        type : String,
        required : true
    },
    experienceYears:
    {
        type : Number,
        default : 0
    },
    profilePhoto:
    {
        type : String,
        default : ""
    },
},{timestamps : true});
export const Worker = mongoose.model("Worker",workerSchema);