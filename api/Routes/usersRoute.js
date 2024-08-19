import express from "express";
import authController from "../Controllers/authController.js";
import userController from "../Controllers/userController.js";
import filterData from "../Utilities/filterData.js";

const router = express.Router();

router.post("/sign-up", authController.signUp);
router.post("/login", authController.login);
router.post("/admin-login", authController.loginAsAdmin);
router.post("/logout", authController.logout);
router.patch("/forgot-password", userController.forgotPassword);
router.patch("/forgot-password/:email/:otp", authController.verifyOtp);

//temporary route for development
router.delete("/deleteAllUsers", userController.deleteAllUsers);

// All routes below this middleware should be protected user must logged in to access these routes
router.use(authController.protect);

router.get("/getme", userController.getMe);
router.patch("/update-me", filterData("User"), userController.updateMe);
router.patch(
  "/reset-my-password",
  authController.authorize("customer", "seller"),
  filterData("PasswordReset"),
  userController.resetPassword
);
router.patch("/delete-me", userController.deleteMe);

// Below routes only access to the admin
router.use(authController.authorize("admin"));

router.route("/").get(userController.getAllUsers);
router
  .route("/:id")
  .get(userController.getUser)
  .delete(userController.deleteUser);

export default router;
