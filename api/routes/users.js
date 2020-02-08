const express = require('express')
const router = express.Router()
const checkAuth = require('../middlewares/check-auth')


const userController = require('../controllers/userController')

router.post('/login',userController.login)

router.post('/signup', userController.signup)

router.delete('/delete/:userId', checkAuth, userController.delete_user)

module.exports = router