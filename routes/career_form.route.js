import express from "express";
import { addCareerForm, getCareerForms, getCareerFormById, deleteCareerForm, updateCareerForm,searchCareerForms} from "../controllers/career_form.controller.js";
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/addCareerForm").post( addCareerForm);
router.route("/getCareerForms").get( getCareerForms);
router.route("/getCareerFormById/:id").put( getCareerFormById);
router.route("/updateCareerForm/:id").post( updateCareerForm);
router.route("/deleteCareerForm/:id").delete(deleteCareerForm);
router.route("/searchCareerForms").post( searchCareerForms);

export default router;