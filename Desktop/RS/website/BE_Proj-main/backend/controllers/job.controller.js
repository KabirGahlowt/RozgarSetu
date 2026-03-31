import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js"

export const postJob = async(req,res) => {
    try
    {
        const{title,description,requirements,salary,location,jobType} = req.body;
        const userId = req.id;

        if(!title || !description || !requirements || !salary || !location || !jobType)
        {
            return res.status(400).json({
                message : "Something is missing",
                success : false 
            })
        };

        const job = await Job.create({
            title,
            description,
            requirements,
            salary,
            location,
            jobType,
            createdBy : userId //This will show the client who created the job
        });

        return res.status(201).json({
            message : "New job posted successfully",
            job, 
            success : true 
        });
    }

    catch(error)
    {
        console.log(error);
    }
}

export const getAllJobs = async(req,res) => {
    try
    {
        const keyword = req.query.keyword || "";
        const query = {
            $or:[
                {title : {$regex:keyword, $options:"i"}},
                {description : {$regex:keyword, $options:"i"}}
            ]
        };

        const jobs = await Job.find(query).populate({
            path : "createdBy"
        }).sort({createdAt:-1});

        if(!jobs){
            return res.status(404).json({
                message : "Jobs not found",
                success : false 
            })
        };

        return res.status(200).json({
            jobs,
            success : true 
        })
    }

    catch(error)
    {
        console.log(error);
    }
}

export const getJobById = async(req,res) => {
    try
    {
        const jobId = req.params.id; //This will be the id obtained when the job is created by the client
        const job = await Job.findById(jobId);
        if(!job)
        {
            return res.status(404).json({
                message : "Jobs not found",
                success : false 
            })
        };
        
        return res.status(200).json({
            job,
            success : true 
        })
    }

    catch(error)
    {
        console.log(error);
    }
}