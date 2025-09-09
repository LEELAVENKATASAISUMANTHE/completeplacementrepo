import { asyncHandler } from "../utils/AsyncHandler.js";
import { assignPermissionToRole,removePermissionFromRole } from "../db/role.db.js";

export const assignPermission = asyncHandler(async (req, res) => {
  const { roleId, permissionId } = req.body;
  try {
    await assignPermissionToRole(roleId, permissionId);
    res.status(201).json({ success: true, route: req.originalUrl, message: "Permission assigned successfully" });
  } catch (error) {
    res.status(500).json({ success: false, route: req.originalUrl, message: "Error assigning permission", error });
  }
});

export const removePermissions = asyncHandler(async (req, res) => {
  const { roleId, permissionId } = req.body;
  try {
    await removePermissionFromRole(roleId, permissionId);
    res.status(200).json({ success: true, route: req.originalUrl, message: "Permission removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, route: req.originalUrl, message: "Error removing permission", error });
  }
});

