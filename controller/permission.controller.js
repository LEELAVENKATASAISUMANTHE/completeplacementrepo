import { asyncHandler } from "../utils/AsyncHandler.js";
import { createPermissions, deletePermission} from "../db/permission.db.js";
import joi from 'joi';

const insertSchema = joi.object({// validation for input data for creating permission
  name: joi.string().min(3).max(30).required().pattern(new RegExp('^[a-zA-Z.]{3,30}$')),
  description: joi.string().min(3).max(100).required()
});
export const insertPermission = asyncHandler(async (req, res) => {// create permission input {"name":"string","description":"string"}
  const permissionData = req.body;
  try {
    const { error } = insertSchema.validate(permissionData);
    if (error) {
      return res.status(400).json({ route: req.originalUrl, success: false, message: "Invalid permission data", error: error.details[0].message });
    }
    const newPermission = await createPermissions(permissionData);
    res.status(201).json({ route: req.originalUrl, success: true, message: "Permission created successfully", permission: newPermission });
  } catch (error) {
    res.status(500).json({ route: req.originalUrl, success: false, message: "Error creating permission", error: error.message });
  }
});

const removeSchema = joi.object({// validation for input data for removing permission
  id: joi.number().integer().required().min(1).max(1000)
});
export const removePermission = asyncHandler(async (req, res) => {
  const permissionId = req.params.id;
  try {
    const { error } = removeSchema.validate({ id: permissionId });
    if (error) {
      return res.status(400).json({ route: req.originalUrl, success: false, message: "Invalid permission ID", error: error.details[0].message });
    }
    await deletePermission(permissionId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ route: req.originalUrl, success: false, message: "Error deleting permission", error: error.message });
  }
});

