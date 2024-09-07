require('dotenv').config()

const mockData = require('./mock-data.json')
const Job = require('./models/Job')
const connectDB = require('./db/connect')

const start = async() =>{
    try{
        await connectDB(process.env.MONGO_URL_NEW)
        await Job.create(mockData)
        console.log('Sucess !!!');
        process.exit(0);
    }catch(err){
        console.log(err);
        process.exit(1);
    }
}

start()