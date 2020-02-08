const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const morgan = require('morgan')
const path = require('path')

const app = express()
mongoose.Promise = global.Promise

require('dotenv').config()

// routes
const productRoutes = require('./api/routes/products')
const orderRoutes = require('./api/routes/orders')
const userRoutes = require('./api/routes/users')


// connecting database
mongoose.connect('mongodb://localhost:27017/api', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
.then(()=>console.log('Connected to the database'))
.catch((err)=>console.log("Error in connecting to database ", err))

app.use('/uploads', express.static(path.join(__dirname,'uploads')));
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(morgan('dev'))

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
      return res.status(200).json({});
    }
    next();
  });

// Routes which handle requests
app.use('/products', productRoutes)
app.use('/orders', orderRoutes)
app.use('/users', userRoutes)

app.use((req, res, next)=>{
    const error = new Error('Not Found')
    error.status=404
    next(error)
})

app.use((error, req, res, next)=>{
    res.status(error.status || 500)
    res.json({
        error: {
            message: error.message
        }
    })
})
 


module.exports = app