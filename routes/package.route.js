import express from "express";
import {
  addPackage,
  getPackage,
  updatePackage,
  deletePackage,
  searchPackages,
} from "../controllers/contact.controller.js";
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/addPackage").post(addPackage);
router.route("/getPackages").get(getPackage);
router.route("/updatePackage/:id").post(updatePackage);
router.route("/deletePackage/:id").delete(deletePackage);
router.route("/searchPackages").post(searchPackages);

export default router;
