require("dotenv").config();
const mongoose = require("mongoose");
const { getSecret } = require("./keyVault");

async function putKeyVaultSecretInEnvVar() {
  const secretName = process.env.KEY_VAULT_SECRET_NAME_DATABASE_URL;
  const keyVaultName = process.env.KEY_VAULT_NAME;

  console.log(secretName);
  console.log(keyVaultName);

  if (!secretName || !keyVaultName)
    throw Error("getSecret: Required params missing");

  connectionString = await getSecret(secretName, keyVaultName);
  process.env.DATABASE_URL = connectionString;
}

async function getConnectionInfo() {
  if (!process.env.DATABASE_URL) {
    await putKeyVaultSecretInEnvVar();

    if (!process.env.DATABASE_URL) {
      throw new Error("No value in DATABASE_URL in env var");
    }
  }

  const DATABASE_NAME = process.env.DATABASE_NAME || "premarital-counseling-database";

  // Add MongoDB connection options for Azure Cosmos DB
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: false,
    maxIdleTimeMS: 120000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 30000,
    ssl: true,
    sslValidate: false,  // Thêm option này
    directConnection: true  // Thêm option này
  };

  return {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_NAME: DATABASE_NAME,
    OPTIONS: options,
  };
}

// Add new function to establish connection
async function connectToDatabase() {
  const { DATABASE_URL, DATABASE_NAME, OPTIONS } = await getConnectionInfo();

  try {
    await mongoose.connect(DATABASE_URL, {
      ...OPTIONS,
      dbName: DATABASE_NAME,
    });
    console.log("Connected to Azure Cosmos DB");
  } catch (error) {
    console.error("Error connecting to Azure Cosmos DB:", error);
    throw error;
  }
}

module.exports = {
  getConnectionInfo,
  connectToDatabase,
};
