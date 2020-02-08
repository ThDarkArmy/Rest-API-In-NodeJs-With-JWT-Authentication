const express = require('express')
const router = express.Router()
const Product = require('../models/product')
const mongoose = require('mongoose')
const multer = require('multer')
const checkAuth = require('../middlewares/check-auth')

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'uploads/')
    },
    filename: function(req, file, cb){
        cb(null, 'image'+file.originalname)
    }
})

const fileFilter = (req, file, cb)=>{
    if( file.mimetype==='image/jpeg' || file.mimetype==='image/jpg' || file.mimetype==='image/png'){
        cb(null, true)
    }else{
        cb(null, false)
    }
}

const upload = multer({
    storage : storage,
    limits : { 
        fileSize : 1024 * 1024 * 10
    },
    fileFilter : fileFilter
})

router.get('/', (req, res, next)=>{
    Product.find({}).select('_id name price productImage').exec()
    .then((docs)=>{
        const response = {
            count: docs.length,
            products: docs.map(doc=>{
                return{
                    name: doc.name,
                    price: doc.price,
                    id: doc._id,
                    productImage: doc.productImage,
                    request: {
                        type: 'GET',
                        url : "http://localhost:4000/products/"+doc._id
                    }
                }  
            })
        }
        res.status(200).json(response)
    })
    .catch((err)=>{
        console.log(err)
        res.status(400).json({error: err})
    })
   
})

router.post('/', upload.single('productImage'), checkAuth ,(req, res, next)=>{
    if(!req.file){
        console.log("File doesn't exists")
    }
    console.log(req.file)
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage : req.file.path
    })
    product.save().then((result)=>{
        console.log(result)
        res.status(200).json({
            message: 'product saved in the database',
            product: {
                name : result.name,
                price : result.price,
                id : result._id,
                productImage: result.productImage,
                request : {
                    type : "GET",
                    url : "http://localhost:4000/products"+result._id
                }
            }
        }) 
    }).catch((err)=>{
        console.log("Error in saving product to the database", err)
        res.status(501).json({
            error : err
        })
    }) 
})

router.get('/:productId', (req, res, next)=>{
    const id = req.params.productId
    Product.findById(id).select('name price _id productImage').exec()
    .then((doc)=>{
        if(doc){
            res.status(200).json({
                product: doc,
                request : {
                    type: 'GET',
                    url: 'http://localhost:4000/products'+doc._id
                }
            })
        }else{
            res.status(400).json({message: "No valid data found for provided id"})
        }
        
    })
    .catch((err)=>{
        res.status(500).json({error: err})
    })
})

router.patch('/:productId', (req, res, next)=>{
    const id = req.params.productId
    const updateOps = {}
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value
    }

    Product.updateOne({_id: id}, {$set: updateOps}).select('name price _id').exec()
    .then((result)=>{
        res.status(200).json({
            message: "Products Docs Updated",
            result: result,
                request : {
                    type: 'GET',
                    url: 'http://localhost:4000/products/'+id
                }
            })
    })
    .catch((err)=>{
        res.status(500).json({message: "Error in updation of products", error: err})
    })
})

router.delete('/:productId', checkAuth, (req, res, next)=>{
    const id = req.params.productId
    Product.remove({_id: id}).exec()
    .then((result)=>{
        res.status(200).json({
            message:"Product is removed successfully", 
            result: result,
            request: {
                type: "POST",
                url: "http://localhost:4000/products",
                body: {
                    name: "String", 
                    price: "Number"
                }
            }
        })
    })
    .catch((err)=>{
        res.status(400).json({message: "Error in removing product"})
    })
})

module.exports = router