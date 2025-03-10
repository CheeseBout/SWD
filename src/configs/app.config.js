module.exports = {
  PORT: process.env.PORT || 8080,
  DB_URL: process.env.DB_URL,
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  JWT: {
    secretKey: process.env.JWT_KEY,
    accessTokenLife: "1h", // 1 hour
    refreshTokenLife: "7d", // 7 days
  },
  email: {
    name: "hello",
    host: process.env.EMAIL_HOST ?? "sandbox.smtp.mailtrap.io",
    port: process.env.EMAIL_PORT ?? 2525,
    auth: {
      user: process.env.EMAIL_USER ?? "4c0f5c7ad6031b",
      pass: process.env.EMAIL_PASS ?? "75f836b0c577a4",
    },
  },
  MAILERSENDAPI: {
    apiKey: process.env.MAILERSEND_API_KEY,
  },
  GOOGLEMEETAPI: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    CALLBACK_URL: process.env.REDIRECT_URL,
    CALENDAR_ID: process.env.CALENDAR_ID,
  },
  GOOGLEAPIMAIL: {
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    secure: true,
    tls: {
      rejectUnauthorized: false,
    },
  },
  GOOGLE: {
    FIREBASE_WEB_ID: process.env.GOOGLE_FIREBASE_WEB_CLIENT_ID,
    ANDROID_ID: process.env.GOOGLE_ANDROID_CLIENT_ID,
    IOS_ID: process.env.GOOGLE_IOS_CLIENT_ID,
  },
  VNPay: {
    vnp_TmnCode: process.env.VNPAY_TMN_CODE,
    vnp_HashSecret: process.env.VNPAY_SECURE_SECRET,
    vnp_Url: process.env.VNPAY_URL,
    vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
  },
  HYGRAPH: {
    HYGRAPH_ENDPOINT: process.env.HYGRAPH_ENDPOINT,
    API_TOKEN: process.env.API_TOKEN,
  },
  imgur: {
    clientID: process.env.IMGUR_CLIENT_ID,
    clientSecret: process.env.IMGUR_CLIENT_SECRET,
  },
};
