const express = require('express')
const router = express.Router()
const User = require('../models/user')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")


router.post('/login',(req, res, next)=>{
    const email = req.body.email
    const password = req.body.password
    User.findOne({email: email}).exec()
    .then((user)=>{
        bcrypt.compare(password, user.password, (err, result)=>{
            if(err){
                return res.status(500).json({
                    error: err,
                    message: "Error at compare"
                })
            }
            if(result){
                const token = jwt.sign({
                    email: email,
                    _id : user._id
                },process.env.SECRET_KEY,{
                    expiresIn : "1h"
                })
                return res.status(200).json({
                    message: "logged in",
                    user: user,
                    token: token
                })
            }
            res.status(500).json({
                error: err,
                message: "Error at compare"
            })
        })
    })
    .catch(err=>{
        res.status(401).json({
            error : err,
            message: "catch err"
        })
    })
})


router.post('/signup', (req, res, next)=>{
    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    })
    User.findOne({email:user.email}).then((user)=>{
        if(user){
            res.status(409).json({
                message: "user alraedy exists"
            })
        }
    })
    console.log(user)
    //res.status(200).json({user: user})
    bcrypt.genSalt(10, (err, salt)=>{
        if(err){
            return res.status(501).json({message: "salt error", error: err})
        }
        bcrypt.hash(user.password, salt, (err, hash)=>{
            if(err){
                res.status(501).json({error: err, message: "error while hashing"})
            }else{
                user.password = hash
                user.save().then((result)=>{
                    res.status(201).json({
                        message: "user created",
                        user: user
                    })
                }).catch((err)=>{
                    console.log(err)
                    res.status(501).json({
                        error: err,
                        message: "catch error"
                    })
                })
            }
        })
    })
})

router.delete('/:userId', (req, res, next)=>{
    User.remove({_id: req.params.userId}).then((result)=>{
        res.status(200).json({
            message: "User deleted",
            result: result
        })
    }).catch((err)=>{
        console.log(err)
        res.status(501).json({
            error: err,
        })
    })
})








module.exports = router