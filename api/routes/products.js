const express = require('express')
const router = express.Router()
const multer = require('multer')
const checkAuth = require('../middlewares/check-auth')
const productController = require('../controllers/productController')

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

router.get('/',productController.get_all_products)

router.post('/', upload.single('productImage'), checkAuth ,productController.add_product)

router.get('/:productId',productController.get_product)

router.patch('/:productId',checkAuth, productController.update_product)

router.delete('/:productId', checkAuth, productController.delete_product)

module.exports = router