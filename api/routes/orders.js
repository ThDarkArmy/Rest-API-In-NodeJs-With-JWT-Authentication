const express = require('express')
const router = express.Router()
const Order = require('../models/order')
const Product = require('../models/product')
const mongoose = require('mongoose')
const checkAuth = require('../middlewares/check-auth')

router.get('/',checkAuth, (req, res, next)=>{
    Order.find({}).select('_id product quantity').populate('product', 'name price').exec()
    .then(docs=>{
        res.status(201).json({
            count : docs.length,
            orders : docs.map(doc=>{
                return {
                    _id : doc._id,
                    product: doc.product,
                    quantity : doc.quantity,
                    request : {
                        type : 'GET',
                        url : 'http://localhost:4000/orders/'+doc._id
                    }
                }
            })
        })
    }).catch(err=>{
        res.status(400).json({
            message : "error occured while getting orders",
            error : err
        })
    })
})

router.post('/',checkAuth, (req, res, next)=>{
    Product.findById({_id: req.body.product})
    .then((product)=>{
        if(!product){
            return res.status(400).json({
                message: "product not found"
            })
        }
        const order = new Order({
            _id : new mongoose.Types.ObjectId(),
            product: req.body.product,
            quantity : req.body.quantity
        })
        return order.save()
    }).then((result)=>{
            console.log(result)
            return res.status(201).json({
                message: "Order stored",
                createdOrder : {
                    _id : result._id,
                    product : result.product,
                    quantity: result.quantity
                },
                request : {
                    type : 'GET',
                    url : 'http://localhost:4000/orders/'+result._id
                }
            })
        }).catch((err)=>{
        res.status(500).json({
            message: "Error while saving orders",
            error : err
        })
    })
})

router.get('/:orderId',checkAuth, (req, res)=>{
    Order.findById({_id: req.params.orderId}).populate('product','name price').exec()
    .then((order)=>{
        if(!order){
            return res.status(404).json({
                message : "Order not found!"
            })
        }
        res.status(201).json({
            order: order,
            request : {
                type : 'GET',
                url : 'http://localhost:4000/orders/'+order._id
            }
        })
    }).catch((err)=>{
        res.status(404).json({
            error : err
        })
    })
})

router.delete('/:orderId',checkAuth, (req, res, next)=>{
    Order.remove({_id : req.params.orderId}).exec()
    .then(result=>{
        res.status(201).json({
            message: "Order Deleted",
            request : {
                type : 'GET',
                url : 'http://localhost:4000/orders/'+req.params.orderId,
                body : {
                    productId : 'ID', quantity : 'Number'
                }
            }
        })
    }).catch((err)=>{
        res.status(404).json({
            error : err
        })
    })
})


module.exports = router