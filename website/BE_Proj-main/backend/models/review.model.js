import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        worker:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Worker",
            required: true,
        },
        client:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        rating:{
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment:{
            type: String
        }
    },{timestamps:true}
);

export const Review = mongoose.model("Review", reviewSchema);