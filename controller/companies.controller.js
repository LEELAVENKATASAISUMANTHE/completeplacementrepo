import { asyncHandler } from "../utils/AsyncHandler.js";
import { getPool } from "../db/setup.db.js";
import { v2 as cloudinary } from "cloudinary";
import { createcompany as createCompanyDB, deleteCompanyById, getCompanyById, updateCompanyById } from "../db/company.db.js";
import joi from "joi";
import fs from "fs/promises";
import path from "path";

const companySchema = joi.object({
  Name: joi.string().min(2).max(100).required(),
  email: joi.string().email().required(),
  logo: joi.string().uri().required(),
  description: joi.string().max(500).required(),
  headquarters: joi.array().items(joi.string().max(100)).min(1).required().unique(),
  sub_branch_location: joi.array().items(joi.string().max(100)).min(1).unique(),
});

const updateCompanySchema = joi.object({
  Name: joi.string().min(2).max(100),
  email: joi.string().email(),
  logo: joi.string().uri(),
  description: joi.string().max(500),
  headquarters: joi.array().items(joi.string().max(100)).min(1).unique(),
  sub_branch_location: joi.array().items(joi.string().max(100)).min(1).unique(),
});

export const createCompany = asyncHandler(async (req, res) => {
  const data = req.body;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

let uploadedUrl;
  try {
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "companies",
      resource_type: "image",
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    });
    uploadedUrl = uploadResult.secure_url;
  } catch (err) {
    return res.status(502).json({ status: "error", message: "Image upload failed", detail: err.message });
  } finally {
    try { await fs.unlink(req.file.path); } catch (_) {}
  }
  data.logo = uploadedUrl;

  const { error } = companySchema.validate(data, { abortEarly: false });
  if (error) {
    return res.status(400).json({ status: "error", message: "Validation failed", detail: error.details });
  }
  
  // Map the data to match database column names
  const mappedData = {
    name: data.Name,  // Map capital N to lowercase n
    email: data.email,
    logo: data.logo,
    description: data.description,
    headquarters: data.headquarters,
    sub_branch_location: data.sub_branch_location
  };
  
  console.log(mappedData);
  const result = await createCompanyDB(mappedData);
  res.json({ status: "success", message: "Company created", data: result.rowCount });
});


export const deleteCompany = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await deleteCompanyById(id);
  if (result.rowCount === 0) {
    return res.status(404).json({ status: "error", message: "Company not found", data: result.rowCount });
  }
  res.json({ status: "success", message: "Company deleted", data: result.rowCount });
});

export const updateCompany = asyncHandler(async (req, res) => {
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  const { id } = req.params;
  
  // Get existing company data from database
  const existingCompany = await getCompanyById(id);
  if (!existingCompany) {
    return res.status(404).json({ status: "error", message: "Company not found" });
  }

  // Get update data from request body
  let updateData = req.body;

  // Handle file upload if present
  if (req.file) {
    let public_id;
    try {
      // Extract public ID from existing logo URL
      const getPublicIdFromUrl = (imageUrl) => {
        const url = new URL(imageUrl);
        const parts = url.pathname.split('/');
        const publicIdWithExtension = parts.slice(-2).join('/'); 
        const parsed = path.parse(publicIdWithExtension); 
        return path.join(parsed.dir, parsed.name);
      };
      
      public_id = getPublicIdFromUrl(existingCompany.logo);
    } catch (error) {
      console.error('Error extracting public_id from URL:', error);
    }

    // Delete old image from Cloudinary
    if (public_id) {
      try {
        const deleteResult = await cloudinary.uploader.destroy(public_id);
        console.log('Successfully deleted old image:', deleteResult);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }

    // Upload new image
    let uploadedUrl;
    try {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "companies",
        resource_type: "image",
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      });
      uploadedUrl = uploadResult.secure_url;
    } catch (err) {
      return res.status(502).json({ 
        status: "error", 
        message: "Image upload failed", 
        detail: err.message 
      });
    } finally {
      try { 
        await fs.unlink(req.file.path); 
      } catch (_) {}
    }

    // Update logo URL in data
    updateData.logo = uploadedUrl;
  }

  // Validate update data
  const { error } = updateCompanySchema.validate(updateData, { abortEarly: false });
  if (error) {
    return res.status(400).json({ 
      status: "error", 
      message: "Validation failed", 
      detail: error.details 
    });
  }

  // Map data to match database column names
  const mappedData = {
    name: updateData.Name || existingCompany.name,
    email: updateData.email || existingCompany.email,
    logo: updateData.logo || existingCompany.logo,
    description: updateData.description || existingCompany.description,
    headquarters: updateData.headquarters || existingCompany.headquarters,
    sub_branch_location: updateData.sub_branch_location || existingCompany.sub_branch_location
  };

  // Update company in database
  const result = await updateCompanyById(id, mappedData);
  
  if (result.rowCount === 0) {
    return res.status(404).json({ 
      status: "error", 
      message: "Company not found or no changes made" 
    });
  }

  res.json({ 
    status: "success", 
    message: "Company updated successfully", 
    data: result.rowCount 
  });
});
