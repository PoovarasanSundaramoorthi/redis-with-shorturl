import express from "express";
import passport from "passport";
import { googleLoginSuccess, googleLogout } from "../controller/authController.js";

const authRouter = express.Router();

// Initiate Google login
authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Callback after Google authentication
authRouter.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/auth/login-failed",
    }),
    (req, res) => {
        res.redirect("/auth/success");
    }
);

// Success route
authRouter.get("/success", googleLoginSuccess);

// Logout route
authRouter.get("/logout", googleLogout);

// // Route to initiate Google Sign-In
// authRouter.get(
//     "/auth/google",
//     passport.authenticate("google", { scope: ["profile", "email"] })
// );

// // Callback route after Google authentication
// authRouter.get(
//     "/auth/google/callback",
//     passport.authenticate("google", { failureRedirect: "/" }),
//     (req, res) => {
//         res.status(200).json({
//             status: "success",
//             message: "You are authenticated!",
//             user: req.user,
//         });
//     }
// );

// // Logout route
// authRouter.get("/logout", (req, res) => {
//     req.logout((err) => {
//         if (err) {
//             return res.status(500).json({ status: "fail", message: "Logout failed" });
//         }
//         res.status(200).json({ status: "success", message: "Logged out successfully" });
//     });
// });

export default authRouter;
