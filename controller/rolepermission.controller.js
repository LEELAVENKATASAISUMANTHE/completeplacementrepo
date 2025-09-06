import { asyncHandler } from "../utils/AsyncHandler.js";
import { assignPermissionToRole, getAllRolePermissions, removePermissionFromRole, getallpermissionbyroleid, getallrolebypermissionid } from "../db/role.db.js";

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
export const fetchAllRolePermissions = asyncHandler(async (req, res) => {
  try {
    const rolePermissions = await getAllRolePermissions();
    res.status(200).json({ success: true, route: req.originalUrl, data: rolePermissions });
  } catch (error) {
    res.status(500).json({ success: false, route: req.originalUrl, message: "Error fetching role permissions", error });
  }
});
export const fetchAllPermissionsByRoleId = asyncHandler(async (req, res) => {
  const roleId = req.params.roleId;
  try {
    const permissions = await getallpermissionbyroleid(roleId);
    res.status(200).json({ success: true, route: req.originalUrl, data: permissions });
  } catch (error) {
    res.status(500).json({ success: false, route: req.originalUrl, message: "Error fetching permissions by role ID", error });
  }
});
export const fetchAllRolesByPermissionId = asyncHandler(async (req, res) => {
  const permissionId = req.params.permissionId;
  try {
    const roles = await getallrolebypermissionid(permissionId);
    res.status(200).json({ success: true, route: req.originalUrl, data: roles });
  } catch (error) {
    res.status(500).json({ success: false, route: req.originalUrl, message: "Error fetching roles by permission ID", error });
  }
});
