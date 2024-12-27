const catchAsync = require("../utils/catchAsync");

exports.getOverview = catchAsync((req,res)=>{
    res.status(200).render('overview',{title:'All tours'})
  })

  exports.getTour = catchAsync((req,res)=>{
    res.status(200).render('tour',{title:'The forest hiker'})
  })