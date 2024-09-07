const { StatusCodes } = require("http-status-codes")
const { BadRequestError, NotFoundError } = require("../errors")
const Job = require('../models/Job')
const mongoose = require('mongoose')
const moment = require('moment')


const showStats = async (req,res) => {
    let stats = await Job.aggregate([
        { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
        { $group: { _id:'$status', count: {$sum: 1 }} },
    ])
    //refactor backend response then frontend
    // console.log(stats); // from this
    const formattedStats = {};
    stats.forEach(item => {
        formattedStats[item._id] = item.count;
    });
    // console.log(formattedStats); // to this
    const defaultStats = {
        pending: formattedStats.pending || 0,
        interview: formattedStats.interview || 0,
        declined: formattedStats.declined || 0,
    }

    let monthlyApplications = await Job.aggregate([
        { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 },
      ]);
    // console.log(monthlyApplications) // refactor from this
    monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;
      const date = moment()
        .month(month - 1)
        .year(year)
        .format('MMM Y');
      return { date, count };
    })
    .reverse();
    // console.log(formattedApplications) // to this
    res
      .status(StatusCodes.OK)
      .json({ defaultStats,  monthlyApplications})
}

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
    showStats,
}