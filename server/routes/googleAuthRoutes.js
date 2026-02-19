const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

/*
=====================================
1️⃣ Route to start Google login
=====================================
When user clicks "Continue with Google"
Frontend opens:
http://localhost:5000/auth/google
Passport redirects user to Google login page.
*/
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/*
=====================================
2️⃣ Google callback route
=====================================
After successful Google login:
- Google sends user data to backend
- Passport attaches MongoDB user to req.user
- We generate JWT token
- Redirect user to React dashboard with token
*/
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    try {
      // Create JWT token using logged-in user ID
      const token = jwt.sign(
        { id: req.user._id },
        "secretkey", // later move to .env
        { expiresIn: "1d" }
      );

      // Redirect to frontend dashboard with token
      res.redirect(`http://localhost:3000/dashboard?token=${token}`);
    } catch (error) {
      res.redirect("http://localhost:3000/");
    }
  }
);

module.exports = router;
