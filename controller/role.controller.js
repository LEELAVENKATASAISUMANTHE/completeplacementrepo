import { createRoles,getRoles,updateRole,deleteRole,getRoleById,getRoleByName } from "../db/role.db.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

export const createRole = asyncHandler(async (req, res) => {
  const roleData = req.body;
  try {
    const newRole = await createRoles(roleData);
    res.status(201).json({ route: req.originalUrl, success: true, message: "Role created successfully", role: newRole });
  } catch (error) {
    console.error("Error creating role:", error);
    res.status(500).json({ route: req.originalUrl, success: false, error: error.message });
  }
});
export const fetchRoles = asyncHandler(async (req, res) => {
 try {
    const roles = await getRoles();
    res.status(200).json({ route: req.originalUrl, success: true, roles });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ route: req.originalUrl, success: false, error: "Failed to fetch roles" });
 }
});

export const modifyRole = asyncHandler(async (req, res) => {
  const roleId = req.params.id;
  console.log("Role ID to update:", roleId);
  const roleData = {
  name: req.body.name,
  description: req.body.description,
  is_active: req.body.is_active ? true : false
};
  console.log("Role data to update:", roleData);
  try {
    await updateRole(roleId, roleData);
    res.status(200).json({ route: req.originalUrl, success: true, message: "Role updated successfully" });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ route: req.originalUrl, success: false, error: "Failed to update role" });
  }
});

export const removeRole = asyncHandler(async (req, res) => {
  const roleId = req.params.id;
  try {
    await deleteRole(roleId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting role:", error);
    res.status(500).json({ route: req.originalUrl, success: false, error: "Failed to delete role" });
  }
});
export const fetchRoleById = asyncHandler(async (req, res) => {
  const roleId = req.params.id;
  try {
    const role = await getRoleById(roleId);
    res.status(200).json({ route: req.originalUrl, success: true, role });
  } catch (error) {
    console.error("Error fetching role:", error);
    res.status(500).json({ route: req.originalUrl, success: false, error: "Failed to fetch role" });
  }
});

export const fetchRoleByName = asyncHandler(async (req, res) => {
  const roleName = req.params.name;
  try {
    const role = await getRoleByName(roleName);
    res.status(200).json({ route: req.originalUrl, success: true, role });
  } catch (error) {
    console.error("Error fetching role:", error);
    res.status(500).json({ route: req.originalUrl, success: false, error: "Failed to fetch role" });
  }
});

     