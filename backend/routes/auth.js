const express = require('express')
const { login, register, updateUser } = require('../controllers/auth')
const authenticateUser = require('../middleware/authentication')
const testUser = require('../middleware/testUser')
const router = express.Router()

const rateLimiter = require('express-rate-limit')

const apiLimiter = rateLimiter({
    windowMs:15*60*1000, // 15minutes
    max:5,
    message: {
        msg: 'Too many requests. Please try again later.'
    }
})

router.post('/login',apiLimiter,login)
router.post('/register',apiLimiter,register)
router.patch('/updateUser',authenticateUser, testUser, updateUser)

module.exports = router