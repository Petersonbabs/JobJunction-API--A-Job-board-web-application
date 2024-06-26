const Jobs = require("../models/job");
const Categories = require("../models/category");
const fetchDocs = require("../middlewares/fetching");
const { Console } = require("console");

// Create Job
const createJob = async (req, res, next) => {

    const { title, description, salary, requirements, applicationDeadline, category, hiringNum, feedback, location, gender, jobType, experience } = req.body

    
    try {
        
        const assignedCategory = await Categories.findOne({title: {$regex: category, $options: "i"}});
        


        const job = await Jobs.create({ title, description, salary, requirements, experience, applicationDeadline, location, gender, jobType, category : assignedCategory.id, hiringNum, feedback, company: req.user.id })

        if (!job) {
            res.status(404).json({
                status: "fail",
                message: "Unable to post job"
            })

            return
        }


        res.status(201).json({
            status: "success",
            message: "Job successfully posted",
            job
        })

    } catch (error) {
        console.log(error);
        next(error)
    }

}

// get all jobs
const getAllJobs = async (req, res, next) => {

    // query criteria
    let queryCriteria = {}


    if (req.query.search) {
        const { search } = req.query
        const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
        queryCriteria = {
            $or: [
                { title: { $regex: regex}  },
                {description: { $regex: regex} },
                {location: { $regex: regex} },
            ]
        }
    }

    if(req.query.location){
        queryCriteria.location = req.query.location
    }
    if(req.query.experience){
        queryCriteria.experience = req.query.experience
    }
    if(req.query.jobType){
        queryCriteria.jobType = req.query.jobType
        
    }
    if(req.query.status){
        queryCriteria.status = req.query.status
    }

    


    try { 

        const {data, numOfDocs, currentPage, pages, prevPage, nextPage} = await fetchDocs(req, Jobs, queryCriteria, "company", "category")

        const numOfJobs = numOfDocs
        
        const jobs = data

        if (!jobs || jobs.length == 0) {
            res.status(404).json({
                status: "failure",
                message: "Unable to fetch Jobs"
            })
            return
        }

        res.status(200).json({
            status: "success",
            pages,
            currentPage,
            prevPage,
            nextPage,
            numOfJobs,
            jobs
        })


    } catch (error) {
        console.log(error);
        next(error)
    }
}

// get single job
const getSingleJob = async (req, res, next) => {

    try {
        const job = await Jobs.findById(req.params.id).populate("company").populate("category")
        console.log(job.requirements);

        if (!job) {
            res.status(404).json({
                status: "failure",
                message: "Unable to fetch Job"
            })
            return
        }

        res.status(200).json({
            status: "success",
            job
        })

    } catch (error) {
        console.log(error)
        next(error)
    }
}


// Update job
const updateJob = async (req, res, next) => {

    const { title, description, salary, requirements, applicationDeadline, category, hiringNum, feedback, location, gender, jobType } = req.body

    try {

        const assignedCategory = await Categories.findOne({title: {$regex: category, $options: "i"}});

        const job = await Jobs.findById(req.params.id);

        
        if (job.company.toJSON() !== req.user.id && req.user.role !== "admin") {
            res.status(403).json({
                status: "failed",
                message: "Access denied."
            })
            return
        }

        const updatedJob = await Jobs.findByIdAndUpdate(req.params.id, { title, description, salary, requirements, applicationDeadline, location, gender, jobType, category : assignedCategory.id, hiringNum, feedback, company: req.user.id }, { new: true, runValidators: true });

        if (!updatedJob) {

            res.status(404).json({
                status: "fail",
                message: "Unable to update this Job."
            })

            return
        }

        res.status(200).json({
            status: "success",
            message: "successfully updated",
            job: updatedJob
        })

    } catch (error) {
        console.log(error);
        next(error)
    }

}

// Delete job
const deleteJob = async (req, res, next) => {

    try {

        const job = await Jobs.findById(req.params.id);
        
        if (job.company.toString() !== req.user.id && req.user.role !== "admin") {
            res.status(403).json({
                status: "failed",
                message: "Access denied."
            })
            return
        }

        await Jobs.findByIdAndDelete(req.params.id);


        res.status(200).json({
            status: "success",
            message: "job deleted"
        })

    } catch (error) {
        console.log(error);
        next(error)
    }

}

module.exports = { createJob, getAllJobs, getSingleJob, updateJob, deleteJob }