import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import {User} from "../models/user.model.js";

//Useless
export const applyJobs = async(req,res) => {
    try
    {
        const workerId = req.id;
        const jobId = req.params.id;

        if(!jobId)
        {
            return res.status(400).json({
                message : "Job ID is required",
                success : false 
            })
        };

        //Checking if the worker has already applied for the job
        console.log("Worker ID:", workerId); //edited
        console.log("Job ID:", jobId); //edited

        const existingApplication = await Application.findOne({job : jobId, worker : workerId});

        console.log("Existing application found:", existingApplication); //edited

        if(existingApplication)
        {
            return res.status(400).json({
                message : "You have already applied for this job",
                success : false 
            })  
        };

        //Check if that job exists
        const job = await Job.findById(jobId);
        if(!job)
        {
            return res.status(404).json({
                message : "Job not found",
                success : false  
            })
        };

        //Create a new application
        const newApplication = await Application.create({
            job : jobId,
            worker : workerId,
        })

        job.applications.push(newApplication._id);
        await job.save();
        return res.status(201).json({
            message : "Job applied successfully",
            success : true
        })
    }

    catch(error)
    {
        console.log(error);
    }
}

export const hireWorker = async (req, res) => {
    try {
        const clientId = req.id; // logged in client
        const workerId = req.params.id;

        if (!workerId) {
            return res.status(400).json({
                message: "Worker ID is required",
                success: false
            });
        }

        // Check if already hired/requested
        const existingApplication = await Application.findOne({
            worker: workerId,
            client: clientId
        });

        if (existingApplication) {
            return res.status(400).json({
                message: "You have already sent a hire request",
                success: false
            });
        }

        const newHire = await Application.create({
            worker: workerId,
            client: clientId
        });

        return res.status(201).json({
            message: "Hire request sent successfully",
            success: true,
            newHire
        });

    } catch (error) {
        console.log(error);
    }
};

//This is for when a worker wants to see which Jobs they have applied to {Useless}
export const getAppliedJobs = async(req,res) => { 
    try
    {
        const workerId = req.id;
        const application = await Application.find({worker : workerId}).sort({createdAt : -1}).populate({
            path : "job",
            options : {sort : {createdAt : -1}},
            populate : {
                path : "createdBy",
                options : {sort : {createdAt : -1}}
            }
        });

        if(!application)
        {
            return res.status(404).json({
                message : "No jobs have been applied to",
                success : false
            })
        };

        return res.status(200).json({
            application,
            success : true
        })
    }

    catch(error)
    {
        console.log(error);
    }
}

//For the workers to see which clients want to hire them
export const getHireRequestsForWorker = async (req, res) => {
    try {
        const workerId = req.id;

        const requests = await Application.find({ worker: workerId })
            .populate("client")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            requests,
            success: true
        });

    } catch (error) {
        console.log(error);
    }
};


//Client can see who all have applied to their job application {useless}
export const getApplicants = async(req,res) => {
    try
    {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path : "applications",
            options : {sort : {createdAt : -1}},
            populate : {
                path : "worker",
                options : {sort : {createdAt : -1}}
            }
        });

        if(!job)
        {
            return res.status(404).json({
                message : "Job not found",
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

//For the clients to see which workers they have hired
export const getHiredWorkersForClient = async (req, res) => {
    try {
        const clientId = req.id;

        const hires = await Application.find({ client: clientId })
            .populate("worker")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            hires,
            success: true
        });

    } catch (error) {
        console.log(error);
    }
};

//useless
export const updateStatus = async(req,res) => {
    try
    {
        const{status} = req.body;
        const applicationId = req.params.id;

        if(!status)
        {
            return res.status.json({
                message : "Status is required",
                success : false
            })
        };

        //Find the application by application ID
        const application = await Application.findOne({_id : applicationId});
        if(!application)
        {
            return res.status(404).json({
                message : "Application wasn't found",
                success : false
            })
        };

        //Update the status
        application.status = status;
        await application.save();

        return res.status(200).json({
            message : "Status updated successfully",
            success : true 
        });
    }

    catch(error)
    {
        console.log(error);
    }
}

//the new update status where worker will accept/reject 
export const updateHireStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const applicationId = req.params.id;

        const validStatus = ["Pending", "Accepted", "Rejected"];

        if (!validStatus.includes(status)) {
            return res.status(400).json({
                message: "Invalid Status",
                success: false
            });
        }

        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({
                message: "Hire request not found",
                success: false
            });
        }

        application.status = status;
        await application.save();

        return res.status(200).json({
            message: "Hire request updated",
            success: true,
            application,
        });

    } catch (error) {
        console.log(error);
    }
};