const { Schema, model } = require("mongoose");

const applicationSchema = new Schema({

    candidate: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "employees",
    },

    resume: {
        // todo
        type: String,
        requred: [true, "Resume is required"],
    },

    applicationStatus: {
        type: String,
        default: "pending"
    },

    job: {
        type: Schema.Types.ObjectId,
        required: [true, "You must apply to a job"],
        ref: "Jobs"
    },

    company: {
        type: Schema.Types.ObjectId,
        ref: "Companies",
        required: true
    },

    message: {
        type: String
    }

}, {timestamps: true})


module.exports = model("applications", applicationSchema) 