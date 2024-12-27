const Users = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');


exports.createUser = () => {
    res.status(500).json({
        status: 'fail',
        message: 'This route is not for signup. Use /signup for create user',
    });
};
exports.getMe = (req,res,next)=>{
    req.params.id = req.user.id;
    next()
}

exports.getAllUsers = factory.getAll(Users)
exports.getUser    =  factory.getOne(Users);
exports.deleteUser =  factory.deleteOne(Users);
exports.updateUser =  factory.updateOne(Users);
