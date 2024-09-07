const { StatusCodes } = require("http-status-codes")
const { BadRequestError, NotFoundError } = require("../errors")
const Job = require('../models/Job')

const getAllJobs = async(req,res) => {
    const { search, status, jobType, sort  } = req.query;
    const queryObject = {
        createdBy:req.user.userId
    }
    if(search){
        queryObject.position = { $regex:search, $options: 'i'};
    }
    if(status && status !== 'all'){
        queryObject.status = status
    }
    if(jobType && jobType !== 'all'){
        queryObject.jobType = jobType
    }
    let sortOption = '';
    if(sort === 'latest'){
        sortOption = '-createdAt'
    }
    if(sort === 'oldest'){
        sortOption = 'createdAt'
    }
    if(sort === 'a-z'){
        sortOption = 'position'
    }
    if(sort === 'z-a'){
        sortOption = '-position'
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const jobs = await Job
    .find(queryObject,{'__v':0})
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    const totalJobs = await Job.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalJobs / limit);
    res.status(StatusCodes.OK).json({jobs, totalJobs, numOfPages})
}
const getJob = async(req,res) => {
    const { 
        user: {
            userId
        },
        params:{
            id:jobId
        },
    } = req
    const job = await Job.findOne({
        _id:jobId,
        createdBy:userId//potentially, someone can have your job id (hypothetical) so with this we just ensure that only the user (in the token) can access the job.
    },{
        '__v':0
    })
    if(!job){
        throw new NotFoundError(`No job found with id ${jobId}`)
    }
    res.status(StatusCodes.OK).json({job});
}
const createJob = async(req,res) => {
    req.body.createdBy = req.user.userId
    const job = await Job.create(req.body)
    res.status(StatusCodes.CREATED).json({job})
}
const updateJob = async(req,res) => {
    const { 
        user: {
            userId
        },
        params:{
            id:jobId
        },
        body:{
            company,
            position
        }
    } = req
    if(company === '' || position === ''){
        throw new BadRequestError('Company or Position fields cannot be empty')
    }
    const job = await Job.findOneAndUpdate({
        _id:jobId,
        createdBy:userId//same validation
    },req.body,{
        new:true,
        runValidators:true
    }).select('-__v');
    if(!job){
        throw new NotFoundError(`No job found with id ${jobId}`)
    }
    res.status(StatusCodes.OK).json({job});
}
const deleteJob = async(req,res) => {
    const { 
        user: {
            userId
        },
        params:{
            id:jobId
        },
    } = req
    const job = await Job.deleteOne({
        _id:jobId,
        createdBy:userId
    },{
        '__v':0
    })
    if(!job){
        throw new NotFoundError(`No job found with id ${jobId}`)
    }
    res.status(StatusCodes.OK).send('Job deleted');
}

module.exports = {
    getAllJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
}