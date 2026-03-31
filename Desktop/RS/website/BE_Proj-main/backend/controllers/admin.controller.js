import { Admin } from "../models/admin.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

        return res.status(200).cookie("token",token,{maxAge : 1*24*60*60*1000, httpOnly : true, sameSite : 'lax', secure:false}).json({
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