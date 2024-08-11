import express from "express";
import authController from "../Controllers/authController.js";
import userController from "../Controllers/userController.js";
import filterData from "../Utilities/filterData.js";

const router = express.Router();

router.post("/sign-up", authController.signUp);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

//temporary route for development
router.delete("/deleteAllUsers", userController.deleteAllUsers);

router.get("/getme", authController.protect, userController.getMe);
router.patch(
  "/update-me",
  authController.protect,
  filterData("User"),
  userController.updateMe
);
router.patch(
  "/reset-my-password",
  authController.protect,
  filterData("PasswordReset"),
  userController.resetPassword
);
router.patch("/forgot-password", userController.forgotPassword);
router.patch("/forgot-password/:email/:otp", authController.verifyOtp);
router.patch("/delete-me", authController.protect, userController.deleteMe);

router.route("/").get(userController.getAllUsers);
router
  .route("/:id")
  .get(userController.getUser)
  .delete(userController.deleteUser);

export default router;
