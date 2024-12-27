const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const APIFeatures = require('../utils/apiFeatures')

exports.deleteOne = (model)=>{
    return catchAsync(async (req,res)=>{
        const doc = await model.findByIdAndDelete(req.params.id)
        if(!doc) return next(new AppError('No Document found with id',404));
        return res.status(204).json({
            status:'success',
            data:null
        });
    })
}


exports.updateOne = model => catchAsync(async (req,res)=>{
    const modifiedDoc = await model.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    })
    res.status(200).json({
        status:'success',
        data:{
            modifiedDoc
        }
    });
})
    
exports.createOne = model => catchAsync(async (req,res)=>{
    const newDoc = await model.create(req.body)
    res.status(201).json({
        status:'success',
        data:newDoc
    })
})

exports.getOne = (model,popOptions) => catchAsync(async (req,res,next)=>{
    let query = model.findById(req.params.id)
    if(popOptions) query = query.populate(popOptions)
    const doc = await query
    if(!doc){
        return next(new AppError(`No doc find with that ${req.params.id}`,404))
    }
    res.status(200).json({
        status:'success',
        data:doc
    });

})

exports.getAll = (model) => catchAsync(async (req,res)=>{
    let filter = {};
    if(req.params.tourId) filter = {tour : req.params.tourId}
    const features = new APIFeatures(model.find(filter),req.query).filter().sort().limitFields().paginate();
    const doc = await features.query
    res.status(200).json({
        status:'success',
        requestedAt:req.requestTime,
        results:doc.length,
        doc
    });
})


