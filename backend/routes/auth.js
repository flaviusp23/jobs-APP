const express = require('express')
const { login, register, updateUser } = require('../controllers/auth')
const authenticateUser = require('../middleware/authentication')
const testUser = require('../middleware/testUser')
const router = express.Router()

const rateLimiter = require('express-rate-limit')

const apiLimiter = rateLimiter({
    windowMs:2*60*1000, // 15minutes
    max:5,
    handler: function (req, res, next) {
        const now = Date.now();
        const resetTime = req.rateLimit.resetTime || now + this.windowMs;
        const timeRemaining = Math.max(0, resetTime - now);
        const minutesRemaining = Math.ceil(timeRemaining / 60000);
        let msg = `Please try again later in ${minutesRemaining} minutes.`
        if(minutesRemaining <= 1){
            msg = `Please try again in less than a minute.`
        }
        res.status(429).json({
          msg: msg,
        });
      },
})

router.post('/login',apiLimiter,login)
router.post('/register',apiLimiter,register)
router.patch('/updateUser',authenticateUser, testUser, updateUser)

module.exports = router