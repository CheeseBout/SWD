const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const config = require("./app.config");
const authServices = require("../services/auth.services");

passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLEMEETAPI.CLIENT_ID,
      clientSecret: config.GOOGLEMEETAPI.CLIENT_SECRET,
      callbackURL: config.GOOGLEMEETAPI.CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const user = await authRepo.findUserByEmail(profile.emails[0].value);

        // Gán tokens vào profile để gửi đến `loginWithGoogle`
        profile.tokens = { accessToken, refreshToken };
        return done(null, profile);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from the session
passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
