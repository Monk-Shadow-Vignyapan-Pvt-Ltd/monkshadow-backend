import express from "express";
import {
  addService,
  getServices,
  updateService,
  deleteService,
  searchSerives,
} from "../controllers/service.controller.js";
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/addService").post(addService);
router.route("/getServices").get(getServices);
router.route("/updateService/:id").post(updateService);
router.route("/deleteService/:id").delete(deleteService);
router.route("/searchSerives").post(searchSerives);

export default router;
