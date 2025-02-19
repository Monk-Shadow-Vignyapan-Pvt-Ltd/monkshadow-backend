import express from "express";
import {
  addPackage_,
  getPackages,
  updatePackage,
  deletePackage,
  searchPackages,
} from "../controllers/package.controller.js";
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/addPackage_").post(addPackage_);
router.route("/getPackages").get(getPackages);
router.route("/updatePackage/:id").post(updatePackage);
router.route("/deletePackage/:id").delete(deletePackage);
router.route("/searchPackages").post(searchPackages);

export default router;
