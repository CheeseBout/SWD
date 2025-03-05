const express = require("express");
const router = express.Router();
const packageController = require("../controllers/package.controller");

/**
 * @swagger
 * tags:
 *   name: Packages
 *   description: Discount package management
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
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         discount:
 *           type: number
 *         duration:
 *           type: number
 *           description: Duration in days
 *         features:
 *           type: array
 *           items:
 *             type: string
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /package/create-package:
 *   post:
 *     summary: Create a new discount package
 *     tags: [Packages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - duration
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
 *               duration:
 *                 type: number
 *                 example: 30
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Unlimited sessions", "Priority booking", "24/7 support"]
 *     responses:
 *       201:
 *         description: Package created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Package'
 *       400:
 *         description: Package already exists or invalid input
 */

/**
 * @swagger
 * /package/get-all-package:
 *   get:
 *     summary: Get all packages
 *     tags: [Packages]
 *     responses:
 *       200:
 *         description: List of all packages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Package'
 */

/**
 * @swagger
 * /package/get-package/{packageID}:
 *   get:
 *     summary: Get package by ID
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
 *               $ref: '#/components/schemas/Package'
 *       404:
 *         description: Package not found
 */

/**
 * @swagger
 * /package/update-package/{packageID}:
 *   put:
 *     summary: Update a package
 *     tags: [Packages]
 *     parameters:
 *       - in: path
 *         name: packageID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               discount:
 *                 type: number
 *               duration:
 *                 type: number
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Package updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Package'
 *       404:
 *         description: Package not found
 */

/**
 * @swagger
 * /package/delete-package/{packageID}:
 *   put:
 *     summary: Soft delete a package
 *     tags: [Packages]
 *     parameters:
 *       - in: path
 *         name: packageID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Package deleted successfully
 *       404:
 *         description: Package not found
 */

router.post("/create-package", packageController.createPackage);
router.get("/get-all-package", packageController.getAllPackage);
router.get("/get-package/:packageID", packageController.getPackageByID);
router.put("/update-package/:packageID", packageController.updatePackage);
router.put("/delete-package/:packageID", packageController.deletePackage);

module.exports = router;
