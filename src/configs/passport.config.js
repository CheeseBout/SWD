const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const config = require("./app.config");
const authServices = require("../services/auth.services");
const authRepo = require("../repositories/auth.repo");

passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLEMEETAPI.CLIENT_ID,
      clientSecret: config.GOOGLEMEETAPI.CLIENT_SECRET,
      callbackURL: config.GOOGLEMEETAPI.CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, params, profile, done) => {
      try {
        // Combine all tokens and profile info
        const userData = {
          profile: profile,
          tokens: {
            access_token: accessToken,
            refresh_token: refreshToken,
            id_token: params.id_token, // Google sends id_token in params
          },
        };

        console.log("Debug - Google Auth Data:", {
          accessToken: accessToken?.substring(0, 10) + "...",
          refreshToken: refreshToken?.substring(0, 10) + "...",
          idToken: params?.id_token?.substring(0, 10) + "...",
          profile: {
            id: profile.id,
            email: profile.emails?.[0]?.value,
          },
        });

        return done(null, userData);
      } catch (error) {
        console.error("Passport strategy error:", error);
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
