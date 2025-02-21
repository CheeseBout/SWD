module.exports = {
  PORT: process.env.PORT || 3000,
  DB_URL: process.env.DB_URL,
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT: {
    secretKey: process.env.JWT_KEY,
    accessTokenLife: "1d", // 1 day
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
    REDIRECT_URI: process.env.REDIRECT_URL,
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
  VNPay: {
    vnp_TmnCode: process.env.VNP_TMN_CODE,
    vnp_HashSecret: process.env.VNP_HASH_SECRET,
    vnp_Url: process.env.VNP_URL,
  },
};
