import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  updateAccountDetails,
  searchUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  validateUserRegistration,
  validateUserLogin,
  validateUserSearch,
  validateChangePassword,
  validateUpdateAccount,
} from "../validator/user.validator.js";

const router = Router();

router.route("/register").post(validateUserRegistration, registerUser);
router.route("/login").post(validateUserLogin, loginUser);

//secured routes

router.route("/search-user").post(validateUserSearch, verifyJWT, searchUser);
router.route("/logout").post(verifyJWT, logoutUser);
router
  .route("/change-password")
  .post(validateChangePassword, verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router
  .route("/update-account")
  .patch(validateUpdateAccount, verifyJWT, updateAccountDetails);

export default router;
