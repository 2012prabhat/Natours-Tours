const express = require('express');
const path  = require('path')
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const port = 4000;
const fs = require('fs');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require("helmet");
const mongoSantize = require("express-mongo-sanitize");
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const reviewRouter = require('./routes/reviewRouter');
const viewRouter = require('./routes/viewRouter');
const app = express();




app.set('view engine','pug');
app.set('views', path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));


app.use(helmet());

// limit request from same ip
const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 1 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    message: {
        error: "Too many requests",
        message: "You have exceeded the request limit. Please try again later."
      },
})
// app.use(morgan('dev'))


app.use('/api',limiter)

//body parser, reading data from req.body
app.use(express.json({limit:'10kb'}))
app.use(cookieParser());

//Data santization against NoSql query injection
app.use(mongoSantize())

//Data sanitization again XSS attacks
app.use(xss())


//prevent parameter pollution, it clear up the query string
app.use(
    hpp({
      whitelist: ["duration",
        "maxGroupSize",
        "difficulty",
        "ratingsAverage",
        "ratingsQuantity",
        "price"], // Allow 'tags' parameter to have multiple values
    })
  );


app.use((req,res,next)=>{
    console.log('Hello from the middleware')
    next()
})

app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString();
    next()
})


app.use('/',viewRouter)
app.use('/api/v1/tours',tourRouter)
app.use('/api/v1/users',userRouter)
app.use('/api/v1/reviews',reviewRouter)


app.get('/', (req, res) => {
  res.status(200).render('base',{
    tour:'The forest hiker',
    user:'Prabhat'
  });
});

app.all('*',(req,res,next)=>{
    next(new AppError(`Can't find ${req.originalUrl} on this server`,404))
})

app.use(globalErrorHandler)

module.exports = app;