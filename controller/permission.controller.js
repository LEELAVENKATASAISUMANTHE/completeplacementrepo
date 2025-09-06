import { asyncHandler } from "../utils/asyncHandler.js";
import { createPermissions, getPermissions, updatePermission, deletePermission, getPermissionById } from "../db/permission.db.js";

export const insertPrermission = asyncHandler(async (req, res) => {
  const permissionData = req.body;
  try {
    const newPermission = await createPermissions(permissionData);
    res.status(201).json({ route: req.originalUrl, success: true, message: "Permission created successfully", permission: newPermission });
  } catch (error) {
    res.status(500).json({ route: req.originalUrl, success: false, message: "Error creating permission", error: error.message });
  }
});

export const fetchPermissions = asyncHandler(async (req, res) => {
  try {
    const permissions = await getPermissions();
    res.status(200).json({ route: req.originalUrl, success: true, permissions });
  } catch (error) {
    res.status(500).json({ route: req.originalUrl, success: false, message: "Error fetching permissions", error: error.message });
  }
});

export const removePermission = asyncHandler(async (req, res) => {
  const permissionId = req.params.id;
  try {
    await deletePermission(permissionId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ route: req.originalUrl, success: false, message: "Error deleting permission", error: error.message });
  }
});

export const getPermissionId =asyncHandler(async (req, res) => {
  const permissionId = req.params.id;
  try {
    const permission = await getPermissionById(permissionId);
    res.status(200).json({ route: req.originalUrl, success: true, permission });
  } catch (error) {
    res.status(500).json({ route: req.originalUrl, success: false, message: "Error fetching permission", error: error.message });
  }
});
