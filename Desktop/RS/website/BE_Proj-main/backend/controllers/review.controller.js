import { Application } from "../models/application.model.js";
import { Review } from "../models/review.model.js";

export const addReview = async(req, res) => {
    try {
        const clientId = req.id;
        const {workerId, rating, comment} = req.body;

        //Check if the hire exists & is accepted by the worker
        const application = await Application.findOne({
            client: clientId,
            worker: workerId,
            status: "Accepted",
        })

        if(!application){
            return res.status(400).json({
                message: "You can only review after hiring",
                success: false,
            })
        }

        //Preventing duplicate reviews from happening
        const alreadyReviewed = await Review.findOne({
            client: clientId,
            worker: workerId,
        })

        if(alreadyReviewed){
            return res.status(400).json({
                message: "You have already reviewed this worker, calm down",
                success: false,
            })
        }

        const review = await Review.create({
            worker: workerId,
            client: clientId,
            rating,
            comment,
        })

        return res.status(201).json({
            message: "Your review has been added",  
            review,
            success: true,
        })
    } catch (error) {
        console.log(error);
    }
};

export const getWorkerReviews = async(req,res) => {
    try {
        const workerId = req.params.id;

        const reviews = await Review.find({worker: workerId}).populate("client", "fullname profilePhoto"). sort({createdAt: -1});

        const forAvgRating = await Review.find({worker: workerId});

        const avgRating = forAvgRating.reduce((acc,r) => acc + r.rating, 0) / forAvgRating.length || 0;

        return res.status(200).json({
            reviews,
            avgRating,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
};