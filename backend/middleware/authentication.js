const { UnauthenticatedError } = require('../errors')
const User = require('../models/User')
const jwt = require('jsonwebtoken')

const auth = async (req,res,next) =>{
    const authHeader = req.headers.authorization
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        throw new UnauthenticatedError('Authentication invalid')
    }
    const token = authHeader.split(' ')[1]
    try{
        const payload = jwt.verify(token,process.env.JWT_SECRET)
        // const user = User.findById(payload.id).select('-password')   alternative
        // req.user = user

        const testUser = (payload.userId === '66db74e1053875851a461cdb')
        req.user = {userId:payload.userId, testUser}          //to this
        next()
    }catch (err){
        throw new UnauthenticatedError('Authentication invalid')
    }
}

module.exports = auth