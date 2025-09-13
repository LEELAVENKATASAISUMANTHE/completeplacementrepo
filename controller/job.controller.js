import { get } from "http";
import {createJob, deletejobById, updateJobById,getJobById} from "../db/job.db.js";
import joi from "joi";
import { asyncHandler } from "../utils/AsyncHandler.js";


export const jobSchema = joi.object({
  company_id: joi.number().integer().required(),
  title: joi.string().min(2).max(100).required(),
  description: joi.string().min(10).max(1000).required(),
  req_skills: joi.array().items(joi.string()).required(),
  salary_range: joi.string().required(),
  start_date: joi.date().required(),
  end_date: joi.date().required(),
  location: joi.string().max(100),
  is_active: joi.boolean(),
});

export const jobUpdateSchema = joi.object({
  company_id: joi.number().integer(),
  title: joi.string().min(2).max(100),
  description: joi.string().min(10).max(1000),
  req_skills: joi.array().items(joi.string()),
  salary_range: joi.string(),
  start_date: joi.date(),
  end_date: joi.date(),
  location: joi.string().max(100),
  is_active: joi.boolean(),
});

export const createJobController = asyncHandler(async (req, res) => {
  const data = req.body;
  const { error } = jobSchema.validate(data);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  try {
    const job = await createJob(data);
    return res.status(201).json(job);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create job", message: err });
  }
});

export const updateJobController = asyncHandler(async (req, res) => {
  const jobId = parseInt(req.params.id, 10);
 if(isNaN(jobId)) {
    return res.status(400).json({ error: "Invalid job ID" });
 }
 const data = req.body;
  const existingJob = await getJobById(jobId);
  if (!existingJob) {
    return res.status(404).json({ error: "Job not found" });
  }
    const { error } = jobUpdateSchema.validate(data);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
   const insertdata={
    company_id: data.company_id ?? existingJob.company_id,
    title: data.title ?? existingJob.title,
    description: data.description ?? existingJob.description,
    req_skills: data.req_skills ?? existingJob.req_skills,
    salary_range: data.salary_range ?? existingJob.salary_range,
    start_date: data.start_date ?? existingJob.start_date,
    end_date: data.end_date ?? existingJob.end_date,
    location: data.location ?? existingJob.location,
    is_active: data.is_active ?? existingJob.is_active,
  };
  try {
    const updatedJob = await updateJobById(jobId, insertdata);
    return res.status(200).json(updatedJob);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update job", message: err });
  }
});

export const deleteJobController = asyncHandler(async (req, res) => {
  const jobId = parseInt(req.params.id, 10);
  if (isNaN(jobId)) {
    return res.status(400).json({ error: "Invalid job ID" });
    }
  try {
    await deletejobById(jobId);
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete job" });
  }
});