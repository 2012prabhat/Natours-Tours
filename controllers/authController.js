const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const {promisify} = require('util')
const crypto = require('crypto');
const sendEmail = require('../utils/email');


const signToken = id=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
    })
}

const filterObj = (obj,...allowedFields) =>{
    const newObj = {};
    Object.keys(obj).forEach(el=>{
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    })
    return newObj;
}



exports.signUp = catchAsync(async (req,res)=>{
    const newUser = await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm
    });

    const token = signToken(newUser._id)
    res.status(200).json({
        status:'success',
        token,
        data:{
            user:newUser
        }
    })
})


exports.login = catchAsync(async (req,res,next)=>{
    const {email,password} = req.body;

    if(!email || !password){
        return next(new AppError('Please provide email and password',400));
    }
    const user = await User.findOne({email}).select('+password')

    if(!user || !(await user.correctPassword(password,user.password))){
        return next(new AppError('Incorrect email or password',401));
    }
    const token = signToken(user._id)
    res.status(200).json({
        status:'success',
        token 
    })
})

exports.protect = catchAsync(async (req,res,next)=>{
    //1) Getting token and check of it's there
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    console.log(token)
    if(!token){
        return next(new AppError('You are not logged in! Please log in to get access.',401))
    }

    //2 verification of token
    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);
    
    //3 Check if user still exists
    const currentUser = await User.findById(decoded.id);

    if(!currentUser){
        return next(new AppError('The user belonging to this token does not longer exists',401))
    }

    //4 check if user changed password after the token is issued
    
    if(currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password! Please log in again.',401))
    }

    // GRANT Access TO PROTECTED ROUTE
    req.user = currentUser;

    next(); 
})


exports.restrictTo = (...roles)=>{
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            return next(new AppError('You dont have permission to perform this action',403))
        }
        next();
    }
}

exports.forgotPassword = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with this email address.', 404));
    }

    // Generate the random token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send it to the user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `<p>You requested a password reset. Please <a href=${resetURL}>click here to reset your password</a>.</p>
    <p>Your reset token is ${resetToken}</p>
    <p>If you did not request this, please ignore this email.</p>`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your token is valid for only 10 minutes',
            message,
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email',
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error in sending the email. Try again later!', 500));
    }
};



exports.resetPassword = async (req, res, next) => {
    // Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    console.log(hashedToken);

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    console.log(user);

    // If token has not expired and there is a user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // Generate JWT token
    const token = signToken(user._id);

    // Send success response
    res.status(200).json({
        status: 'success',
        token,
    });
};

const createSendToken = async (user,statusCode,res)=>{
    const token = signToken(user._id)
    res.status(statusCode).json({
        status:'success',
        token,
        data:{
            user
        }
    })
}


exports.updatePassword = async (req,res,next) => {
    const user = await User.findById(req.user.id).select('+password');
    const passwordCheck = await user.correctPassword(req.body.passwordCurrent,user.password)
    if(!passwordCheck){
        return next(new AppError('Your password is incorrect',401))
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    createSendToken(user,200,res);
}


exports.updateMe = catchAsync(async (req,res,next)=>{
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This Path is not for updating password.Please use /updateMyPassword path',400))
    }

    const filterBody = filterObj(req.body,'name','email');
    const updatedUser = await User.findByIdAndUpdate(req.user.id,filterBody,{
        new:true,
        runValidators:true
    }) 
    await updatedUser.save()

    res.status(200).json({
        status:'success',
        user:updatedUser
    })
})

exports.deleteMe = catchAsync(async (req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id,{active:false});
    res.status(204).json({
        status:'success',
        data:null
    })
})



