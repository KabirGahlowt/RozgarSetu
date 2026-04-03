import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title:
    {
        type : String,
        required : true
    },

    description:
    {
        type : String,
        required : true
    },

    requirements: //services provided by the worker that the client is in need of
    {
        type : String,
        required : true
    },

    salary:
    {
        type : Number,
        required : true
    },

    location:
    {
        type : String,
        required : true
    },
    jobType:
    {
        type : String,
        required : true
    },
    createdBy:
    {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    workerHired:
    {
        type : mongoose.Schema.Types.ObjectId,
        ref:'Worker'
    },
    applications: [
    {
        type : mongoose.Schema.Types.ObjectId,
        ref:'Application',
        required : true 
    }]
});
export const Job = mongoose.model("Job",jobSchema);