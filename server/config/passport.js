const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        // ALWAYS check by email
        let existingUser = await User.findOne({ email });

        if (existingUser) {
          console.log("User already exists, logging in...");
          return done(null, existingUser);
        }

        console.log("Creating new user...");

        const newUser = new User({
          name: profile.displayName,
          email: email,
          googleId: profile.id,
          authProvider: "google",
          profilePic: profile.photos?.[0]?.value,
        });

        await newUser.save();

        return done(null, newUser);

      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
