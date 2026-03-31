import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";


export const register = async(req,res) => {
    try
    {
        const{fullname, email, phoneNumber, password, address, city, pincode} = req.body;
        if(!fullname || !email || !phoneNumber || !password) // || !address || !city || !pincode
        {
            return res.status(400).json
            ({
                message : "Something is missing",
                success : false
            });
        };

        const file = req.file;
        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

        const user = await User.findOne({email});
        if(user)
        {
            return res.status(400).json
            ({
                message : "User already exists with this email",
                success : false 
            });
        };

        const hashedPassword = await bcrypt.hash(password,10);

        await User.create({
            fullname, 
            email, 
            phoneNumber, 
            password : hashedPassword, 
            address, 
            city, 
            pincode,
            profilePhoto:cloudResponse.secure_url,
        });

        return res.status(201).json({
            message : "Account created successfully",
            success : true
        });
    }
    catch(error)
    {
        console.log(error);
    }
}

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

        let user = await User.findOne({email});
        if(!user)
        {
            return res.status(400).json({
                message : "Incorrect username or password",
                success : false
            });
        };

        const ispasswordMatch = await bcrypt.compare(password, user.password);
        if(!ispasswordMatch)
        {
            return res.status(400).json({
                message : "Incorrect username or password",
                success : false
            });
        };

        const tokenData = {
            userId : user._id
        }
        const token = await jwt.sign(tokenData,process.env.SECRET_KEY,{expiresIn : '1d'});

        user = {
            _id : user._id,
            fullname : user.fullname,
            email : user.email,
            phoneNumber : user.phoneNumber,
            profilePhoto : user.profilePhoto
        }

        return res.status(200).cookie("token",token,{maxAge : 1*24*60*60*1000, httpOnly : true, sameSite : 'lax', secure:false}).json({
            message : `Welcome back ${user.fullname}`,
            user,
            success : true 
        })
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

export const updateProfile = async (req,res) => {
    try
    {
        const {fullname,email,phoneNumber,address,profilePhoto} = req.body;
        console.log(fullname,email,phoneNumber,address,profilePhoto);
        /*if(!fullname || !email || !phoneNumber)
        {
            return res.status(400).json({
                message : "Something is missing",
                success : false
            });
        };*/
        
        //Cloudinary code
        /*const file = req.file;
        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);*/

        let cloudResponse;
        if (req.file) {
            const fileUri = getDataUri(req.file);
            cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        }

        const userId = req.id; //Middleware Authentication

        let user = await User.findById(userId);

        if(!user)
        {
            return res.status(400).json({
                message : "User not found",
                success : false
            })
        }

        //Updating the data
        if(fullname) user.fullname = fullname
        if(email) user.email = email
        if(phoneNumber) user.phoneNumber = phoneNumber
        if(address) user.address = address
        

        if(cloudResponse){
            user.profilePhoto = cloudResponse.secure_url //save the coudinary url
            //user.profile.profilePhotoOriginalName = file.originalname (This is to save the original file name)
        }

        await user.save();

        user = {
            _id : user._id,
            fullname : user.fullname,
            email : user.email,
            phoneNumber : user.phoneNumber,
            address : user.address,
            profilePhoto:user.profilePhoto,
        }

        return res.status(200).json({
            message : "Profile updated successfully",
            user,
            success : true
        })
    }

    catch(error)
    {
        console.log(error);
    }
}