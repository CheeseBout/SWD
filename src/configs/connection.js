require("dotenv").config();
const mongoose = require("mongoose");
const { getSecret } = require("./keyVault");

async function putKeyVaultSecretInEnvVar() {
  try {
    const secretName = process.env.KEY_VAULT_SECRET_NAME_DATABASE_URL;
    const keyVaultName = process.env.KEY_VAULT_NAME;

    if (!secretName || !keyVaultName) {
      throw new Error("🔴 Error: Missing required Key Vault parameters.");
    }

    console.log(
      `🔹 Fetching secret: ${secretName} from Key Vault: ${keyVaultName}`
    );

    const connectionString = await getSecret(secretName, keyVaultName);

    if (!connectionString) {
      throw new Error(
        "🔴 Error: Retrieved secret is empty. Check Key Vault setup."
      );
    }

    process.env.DATABASE_URL = connectionString;
    console.log(
      "✅ Successfully retrieved MongoDB connection string from Key Vault."
    );
  } catch (error) {
    console.error("❌ Error retrieving secret from Key Vault:", error);
    throw error;
  }
}

async function getConnectionInfo() {
  try {
    if (!process.env.DATABASE_URL) {
      await putKeyVaultSecretInEnvVar();

      if (!process.env.DATABASE_URL) {
        throw new Error("🔴 Error: No value found in DATABASE_URL.");
      }
    }

    const DATABASE_NAME =
      process.env.DATABASE_NAME || "premarital-counseling-database";

    // Azure Cosmos DB connection options
    const options = {
      ssl: true, // Required for Azure Cosmos DB
      tlsAllowInvalidCertificates: true, // Allow self-signed certs (debugging only)
      retryWrites: false,
      maxIdleTimeMS: 120000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      replicaSet: "globaldb", // Required for Azure Cosmos DB
    };

    return {
      DATABASE_URL: process.env.DATABASE_URL,
      DATABASE_NAME,
      OPTIONS: options,
    };
  } catch (error) {
    console.error("❌ Error getting database connection info:", error);
    throw error;
  }
}

// Establish connection to MongoDB
async function connectToDatabase() {
  try {
    const { DATABASE_URL, DATABASE_NAME, OPTIONS } = await getConnectionInfo();

    await mongoose.connect(DATABASE_URL, {
      ...OPTIONS,
      dbName: DATABASE_NAME,
    });

    console.log("✅ Successfully connected to Azure Cosmos DB.");
  } catch (error) {
    console.error("❌ Error connecting to Azure Cosmos DB:", error);
    throw error;
  }
}

module.exports = {
  getConnectionInfo,
  connectToDatabase,
};
