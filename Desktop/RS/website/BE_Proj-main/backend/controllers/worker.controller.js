import {Worker} from "../models/worker.model.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Application } from "../models/application.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Review } from "../models/review.model.js";

export const registerWorker = async (req, res) => {
    try
    {
        const{fullname, phoneNumber, password, address, city, pincode, skills, avaliability, experienceYears} = req.body;
        if(!fullname || !phoneNumber || !password || !address || !city || !pincode || !skills || !avaliability || !experienceYears) 
        {
            return res.status(400).json
            ({
                message : "Something is missing",
                success : false
            });
        };

        let profilePhoto = "";
        if (req.file) {
            const fileUri = getDataUri(req.file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            profilePhoto = cloudResponse.secure_url;
        }

        const user = await Worker.findOne({phoneNumber});
        if(user)
        {
            return res.status(400).json
            ({
                message : "Worker already exists with this phone number",
                success : false 
            });
        };

        const hashedPassword = await bcrypt.hash(password,10);

        await Worker.create({
            fullname,  
            phoneNumber, 
            password : hashedPassword, 
            address, 
            city, 
            pincode,
            skills,
            avaliability,
            experienceYears,
            profilePhoto,
        });

        return res.status(201).json({
            message : "Account created successfully",
            success : true
        });

    }
    catch (error)
    {
        console.log(error);
        return res.status(500).json({ message: "Internal server error: " + error.message, success: false });
    }
}

export const loginWorker = async (req,res) => {
    try
    {
        const{phoneNumber, password} = req.body;
        if(!phoneNumber || !password)
        {
            return res.status(400).json({
                message : "Phone number or Password can't be empty",
                success : false
            });
        }

        let worker = await Worker.findOne({phoneNumber});
        if(!worker)
        {
            return res.status(400).json({
                message : "Such worker does not exist",
                success : false 
            });
        }

        const ispasswordMatch = await bcrypt.compare(password,worker.password);
        if(!ispasswordMatch)
        {
            return res.status(400).json({
                message : "Incorrect phone number or password",
                success : false
            });
        }

        const tokenData = {
                workerId : worker._id
            }
            const token = await jwt.sign(tokenData,process.env.SECRET_KEY,{expiresIn : '1d'});

            worker = {
                _id : worker._id,
                fullname : worker.fullname,
                phoneNumber : worker.phoneNumber,
                profilePhoto : worker.profilePhoto,
                city : worker.city,
                address : worker.address,
                pincode : worker.pincode,
                avaliability : worker.avaliability,
                skills : worker.skills,
                experienceYears : worker.experienceYears
            }

            return res.status(200).cookie("token",token,{maxAge : 1*24*60*60*1000, httpOnly : true, sameSite : 'strict'}).json({
                message : `Welcome back ${worker.fullname}`,
                worker,
                success : true 
        })
    }
    catch(error)
    {
        console.log(error);
    }
}

export const getAllWorkers = async (req, res) => {
    try {
        const workers = await Worker.find().sort({ createdAt: -1 });

        if (!workers || workers.length === 0) {
            return res.status(404).json({
                message: "No workers found",
                success: false
            });
        }

        return res.status(200).json({
            workers,
            success: true
        });

    } catch (error) {
        console.log(error);
    }
};

/*export const getWorkerById = async (req, res) => {
  try {
    const workerId = req.params.id;

    const worker = await Worker.findById(workerId).populate({
        path:"applications"
    });

    if (!worker) {
      return res.status(404).json({
        message: "Worker not found",
        success: false,
      });
    }

    return res.status(200).json({
      worker,
      success: true,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};*/

export const getWorkerById = async (req, res) => {
  try {
    const workerId = req.params.id;

    const worker = await Worker.findById(workerId);

    if (!worker) {
      return res.status(404).json({
        message: "Worker not found",
        success: false,
      });
    }

    // get all applications for this worker
    const applications = await Application.find({ worker: workerId });

    return res.status(200).json({
      worker: {
        ...worker._doc,
        applications
      },
      success: true
    });

  } catch (error) {
    console.log(error);
  }
};

export const logoutWorker = async (req,res) => {
    try 
    {
        return res.status(200).cookie("token","",{maxAge : 0}).json({
            message : "Logged out successfully",
            success : true
        })
    }

    catch(error)
    {
        console.log(error);
    }
}

export const updateWorkerProfile = async (req,res) => {
    try
    {
        const {fullname,phoneNumber,address, city, pincode, skills, avaliability, experienceYears, profilePhoto} = req.body;
        /*if(!fullname || !email || !phoneNumber)
        {
            return res.status(400).json({
                message : "Something is missing",
                success : false
            });
        };*/

        let cloudResponse;
        if (req.file) {
            const fileUri = getDataUri(req.file);
            cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        }

        const workerId = req.id; //Middleware Authentication

        let worker = await Worker.findById(workerId);

        if(!worker)
        {
            return res.status(400).json({
                message : "Worker not found",
                success : false
            })
        }

        //Updating the data
        if(fullname) worker.fullname = fullname
        if(phoneNumber) worker.phoneNumber = phoneNumber
        if(address) worker.address = address
        if(city) worker.city = city
        if(pincode) worker.pincode = pincode
        if(skills) worker.skills = skills 
        if(avaliability) worker.avaliability = avaliability
        if(experienceYears) worker.experienceYears = experienceYears

        if(cloudResponse){
            worker.profilePhoto = cloudResponse.secure_url //save the coudinary url
            //user.profile.profilePhotoOriginalName = file.originalname (This is to save the original file name)
        }

        await worker.save();

        worker = {
            _id : worker._id,
            fullname : worker.fullname,
            phoneNumber : worker.phoneNumber,
            city : worker.city,
            address : worker.address,
            pincode : worker.pincode,
            avaliability : worker.avaliability,
            skills : worker.skills,
            experienceYears : worker.experienceYears,
            profilePhoto : worker.profilePhoto
        }

        return res.status(200).json({
            message : "Worker profile updated successfully",
            worker,
            success : true
        })
    }

    catch(error)
    {
        console.log(error);
    }
}

export const updateWorkerById = async (req, res) => {
  try {
    const {
      fullname,
      phoneNumber,
      address,
      city,
      pincode,
      skills,
      avaliability,
      experienceYears,
    } = req.body;

    const workerId = req.params.id; 

    let worker = await Worker.findById(workerId);

    if (!worker) {
      return res.status(404).json({
        message: "Worker not found",
        success: false,
      });
    }

    let cloudResponse;
    if (req.file) {
      const fileUri = getDataUri(req.file);
      cloudResponse = await cloudinary.uploader.upload(fileUri.content);
    }

    if (fullname) worker.fullname = fullname;
    if (phoneNumber) worker.phoneNumber = phoneNumber;
    if (address) worker.address = address;
    if (city) worker.city = city;
    if (pincode) worker.pincode = pincode;
    if (skills) worker.skills = skills;
    if (avaliability) worker.avaliability = avaliability;
    if (experienceYears) worker.experienceYears = experienceYears;

    if (cloudResponse) {
      worker.profilePhoto = cloudResponse.secure_url;
    }

    await worker.save();

    return res.status(200).json({
      message: "Worker updated successfully",
      worker,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAllWorkersForBrowse = async(req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                {fullname: {$regex: keyword, $options: "i"}},
                {skills: {$regex: keyword, $options: "i"}},
            ]
        };
        const workers = await Worker.find(query).sort({createdAt: -1}).lean();
        if(!workers || workers.length === 0) {
            return res.status(404).json({
                message: "Workers not found",
                success: false 
            })
        };

        const workersWithRating = await Promise.all(
            workers.map(async (worker) => {
                const reviews = await Review.find({worker : worker._id});

                const avgRating = reviews.length>0 ? reviews.reduce((acc,r) => acc + r.rating, 0) / reviews.length : 0;

                return {
                    ...worker,
                    avgRating,
                };
            })
        );

        return res.status(200).json({
            workers: workersWithRating,
            success: true 
        })
    } catch (error) {
        console.log(error);
    }
}