import {createJob, deletejobById, updateJobById} from "../db/job.db.js";
import joi from "joi";


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


export const createJobController = async (req, res) => {
  const data = req.body;
  const { error } = jobSchema.validate(data);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  try {
    const job = await createJob(data);
    return res.status(201).json(job);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create job" });
  }
};
//
