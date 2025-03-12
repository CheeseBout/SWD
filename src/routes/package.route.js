const express = require("express");
const router = express.Router();
const packageController = require("../controllers/package.controller");
const { auth } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Packages
 *   description: Counseling package management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Package:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the package
 *         coupleTherapistID:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             userID:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 fullname:
 *                   type: string
 *                 photoURL:
 *                   type: string
 *                 email:
 *                   type: string
 *           description: Couple therapist associated with the package
 *         name:
 *           type: string
 *           description: Name of the package
 *         description:
 *           type: string
 *           description: Detailed description of what the package offers
 *         price:
 *           type: number
 *           description: Base price of the package
 *         discount:
 *           type: number
 *           description: Discount percentage (0-100)
 *         times:
 *           type: number
 *           description: Number of sessions included
 *         comissionFee:
 *           type: number
 *           description: Commission fee for the platform
 *         status:
 *           type: string
 *           enum: [active, inactive, pending]
 *           description: Current status of the package
 *         isActive:
 *           type: boolean
 *           description: Whether the package is currently available
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the package was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the package was last updated
 *       example:
 *         _id: "67cf1c1bb876ba95205199d0"
 *         coupleTherapistID:
 *           _id: "67c724df85e0c3351b1ef814"
 *           userID:
 *             _id: "67c724df85e0c3351b1ef80e"
 *             fullname: "Dr. Jane Smith"
 *             photoURL: "https://example.com/photos/therapist.jpg"
 *             email: "jane@example.com"
 *         name: "Premium Package"
 *         description: "Complete access to all counseling services"
 *         price: 199.99
 *         discount: 20
 *         times: 5
 *         comissionFee: 10
 *         status: "active"
 *         isActive: true
 *         createdAt: "2025-03-10T17:06:35.756Z"
 *         updatedAt: "2025-03-11T15:55:50.761Z"
 */

/**
 * @swagger
 * /package/create-package:
 *   post:
 *     summary: Create a new package
 *     description: Create a new package (admin or couple therapist)
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - discount
 *               - times
 *               - comissionFee
 *               - coupleTherapistID
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Premium Package"
 *               description:
 *                 type: string
 *                 example: "Complete access to all counseling services"
 *               price:
 *                 type: number
 *                 example: 199.99
 *               discount:
 *                 type: number
 *                 example: 20
 *               times:
 *                 type: number
 *                 example: 5
 *               comissionFee:
 *                 type: number
 *                 example: 10
 *               coupleTherapistID:
 *                 type: string
 *                 example: "67c724df85e0c3351b1ef814"
 *     responses:
 *       201:
 *         description: Package created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Package created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Package'
 *       400:
 *         description: Package already exists or invalid input
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - User doesn't have permission
 */

/**
 * @swagger
 * /package/get-all-package:
 *   get:
 *     summary: Get all packages
 *     description: Retrieve a list of all available packages or filter by therapist
 *     tags: [Packages]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter packages by active status
 *       - in: query
 *         name: therapistId
 *         schema:
 *           type: string
 *         description: Filter packages by therapist ID
 *     responses:
 *       200:
 *         description: List of packages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Packages retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Package'
 */

/**
 * @swagger
 * /package/get-package/{packageID}:
 *   get:
 *     summary: Get package by ID
 *     description: Retrieve detailed information for a specific package
 *     tags: [Packages]
 *     parameters:
 *       - in: path
 *         name: packageID
 *         required: true
 *         schema:
 *           type: string
 *         description: Package ID
 *     responses:
 *       200:
 *         description: Package details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Package retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Package'
 *       400:
 *         description: Invalid package ID
 *       404:
 *         description: Package not found
 */

/**
 * @swagger
 * /package/update-package/{packageID}:
 *   put:
 *     summary: Update a package
 *     description: Update details for an existing package (admin or owning therapist)
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: packageID
 *         required: true
 *         schema:
 *           type: string
 *         description: Package ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New package name
 *               description:
 *                 type: string
 *                 description: New package description
 *               price:
 *                 type: number
 *                 description: New price
 *               discount:
 *                 type: number
 *                 description: New discount percentage
 *               times:
 *                 type: number
 *                 description: New number of sessions
 *               comissionFee:
 *                 type: number
 *                 description: New commission fee
 *               status:
 *                 type: string
 *                 enum: [active, inactive, pending]
 *                 description: New status
 *               isActive:
 *                 type: boolean
 *                 description: Package availability status
 *     responses:
 *       200:
 *         description: Package updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Package updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Package'
 *       400:
 *         description: Invalid input or package ID
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - User doesn't have permission
 *       404:
 *         description: Package not found
 */

/**
 * @swagger
 * /package/delete-package/{packageID}:
 *   put:
 *     summary: Soft delete a package
 *     description: Mark a package as inactive (admin or owning therapist)
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: packageID
 *         required: true
 *         schema:
 *           type: string
 *         description: Package ID to delete
 *     responses:
 *       200:
 *         description: Package deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Package deleted successfully
 *                 data:
 *                   $ref: '#/components/schemas/Package'
 *       400:
 *         description: Invalid package ID
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - User doesn't have permission
 *       404:
 *         description: Package not found
 */

/**
 * @swagger
 * /package/hard-delete-package/{packageID}:
 *   delete:
 *     summary: Hard delete a package
 *     description: Permanently delete a package (admin only)
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: packageID
 *         required: true
 *         schema:
 *           type: string
 *         description: Package ID to permanently delete
 *     responses:
 *       200:
 *         description: Package permanently deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Package permanently deleted
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *       400:
 *         description: Invalid package ID
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Only admin can perform this action
 *       404:
 *         description: Package not found
 */

// Standard CRUD routes
router.post("/create-package", auth, packageController.createPackage);
router.get("/get-all-package", packageController.getAllPackage);
router.get("/get-package/:packageID", packageController.getPackageByID);
router.put("/update-package/:packageID", auth, packageController.updatePackage);
router.put("/delete-package/:packageID", auth, packageController.deletePackage);

// Admin-only route
router.delete(
  "/hard-delete-package/:packageID",
  auth,
  packageController.hardDeletePackage
);

module.exports = router;
