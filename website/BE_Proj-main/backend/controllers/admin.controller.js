import { Admin } from "../models/admin.model.js";
import { Worker } from "../models/worker.model.js";
import { User } from "../models/user.model.js";
import { Application } from "../models/application.model.js";
import { Review } from "../models/review.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getAuthCookieOptions, getClearAuthCookieOptions } from "../utils/authCookie.js";

export const login = async (req,res) => {
    try
    {
        const {email, password} = req.body;

        if(!email || !password)
        {
            return res.status(400).json
            ({
                message : "Something is missing",
                success : false
            });
        };

        let admin = await Admin.findOne({email});
        if(!admin)
        {
            return res.status(400).json({
                message : "Incorrect username or password",
                success : false
            });
        };

        const ispasswordMatch = await bcrypt.compare(password, admin.password);
        if(!ispasswordMatch)
        {
            return res.status(400).json({
                message : "Incorrect username or password",
                success : false
            });
        };

        const tokenData = {
            adminId : admin._id
        }
        const token = await jwt.sign(tokenData,process.env.SECRET_KEY,{expiresIn : '1d'});

        admin = {
            _id : admin._id,
            fullname : admin.fullname,
            email : admin.email,
        }

        return res.status(200).cookie("token", token, getAuthCookieOptions()).json({
            message : `Welcome back admin ${admin.fullname}`,
            admin,
            success : true 
        })
    }
    catch(error)
    {
        console.log(error);
    }
}

export const register = async(req,res) => {
    try
    {
        const{fullname, email, password} = req.body;
        if(!email || !password || !fullname) // || !address || !city || !pincode
        {
            return res.status(400).json
            ({
                message : "Something is missing",
                success : false
            });
        };

        const user = await Admin.findOne({email});
        if(user)
        {
            return res.status(400).json
            ({
                message : "Admin already exists with this email",
                success : false 
            });
        };

        const hashedPassword = await bcrypt.hash(password,10);

        await Admin.create({ 
            fullname,
            email,  
            password : hashedPassword, 
        });

        return res.status(201).json({
            message : "Admin created successfully",
            success : true
        });
    }
    catch(error)
    {
        console.log(error);
    }
}

export const logout = async (req,res) => {
    try 
    {
        return res.status(200).cookie("token", "", getClearAuthCookieOptions()).json({
            message : "Logged out successfully",
            success : true
        })
    }

    catch(error)
    {
        console.log(error);
    }
}

export const getDashboard = async (req, res) => {
    try {
        // Panel 1: Recently registered workers (last 10)
        const recentWorkers = await Worker.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("fullname skills address city createdAt profilePhoto");

        // Panel 2: Recently registered clients (last 10)
        const recentClients = await User.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("fullname email phoneNumber address createdAt profilePhoto");

        // Panel 3: Recent hire history (client hired which worker)
        const hireHistory = await Application.find()
            .sort({ createdAt: -1 })
            .limit(20)
            .populate("client", "fullname email profilePhoto")
            .populate("worker", "fullname skills profilePhoto");

        // Panel 4: Least rated workers (workers with avg rating, sorted ascending)
        const allWorkers = await Worker.find().lean();
        const workersWithRatings = await Promise.all(
            allWorkers.map(async (worker) => {
                const reviews = await Review.find({ worker: worker._id })
                    .populate("client", "fullname profilePhoto")
                    .sort({ createdAt: -1 });
                const avgRating = reviews.length > 0
                    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
                    : 0;
                return { ...worker, avgRating, reviews };
            })
        );
        // Only include workers who have at least 1 review, sorted by lowest rating
        const leastRated = workersWithRatings
            .filter(w => w.reviews.length > 0)
            .sort((a, b) => a.avgRating - b.avgRating)
            .slice(0, 10);

        return res.status(200).json({
            recentWorkers,
            recentClients,
            hireHistory,
            leastRated,
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

/** Read-only client profile for admin (no password). */
export const getClientById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select("-password").lean();
        if (!user) {
            return res.status(404).json({ message: "Client not found", success: false });
        }
        return res.status(200).json({ user, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};