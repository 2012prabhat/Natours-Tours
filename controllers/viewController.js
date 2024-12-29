const catchAsync = require("../utils/catchAsync");
const Tours = require("../models/tourModel")

exports.getOverview = catchAsync(async (req,res)=>{
    const tours = await Tours.find()
    res.status(200).render('overview',{title:'All tours',tours})
  })

  exports.getTour = catchAsync(async (req,res)=>{
    const { slug } = req.params;
    const tour = await Tours.findOne({ slug });
    res.status(200).render('tour',{title:tour.name,tour})
  })

  exports.getLoginForm = catchAsync(async (req,res)=>{
    res.status(200).render('login',{title:'Log Into Your Account'})
  })

