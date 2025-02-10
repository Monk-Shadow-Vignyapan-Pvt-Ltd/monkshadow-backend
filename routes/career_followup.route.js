import express from "express";
import { addCareerFollowup, getCareerFollowups, getCareerFollowupById, deleteCareerFollowup, updateCareerFollowup} from "../controllers/career_followup.controller.js";
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/addCareerFollowup").post( addCareerFollowup);
router.route("/getCareerFollowups").get( getCareerFollowups);
router.route("/getCareerFollowupById/:id").put( getCareerFollowupById);
router.route("/updateCareerFollowup/:id").post( updateCareerFollowup);
router.route("/deleteCareerFollowup/:id").delete(deleteCareerFollowup);

export default router;