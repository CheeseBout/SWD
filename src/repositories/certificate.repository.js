const CERTIFICATE = require("../models/certificate.model");
const COUPLETHERAPIST = require("../models/coupleTherapist.model");

class CertificateRepository {
  async findOne(filter) {
    return await CERTIFICATE.findOne(filter);
  }

  async findCertificateById(certificateID) {
    return await CERTIFICATE.findById(certificateID);
  }

  async updateCertificateVerification(certificateID) {
    return await CERTIFICATE.findByIdAndUpdate(
      certificateID,
      {
        $set: { isCertificateVerified: true },
      },
      { new: true }
    );
  }

  async createCertificateDenial({ certificateID, reason }) {
    try {
      // Update in COUPLETHERAPIST collection
      await COUPLETHERAPIST.findOneAndUpdate(
        { "certificates.certificateID": certificateID },
        {
          $set: {
            "certificates.$[cert].isCertificateVerified": false,
            "certificates.$[cert].reason": reason,
          },
        },
        {
          arrayFilters: [{ "cert.certificateID": certificateID }],
          new: true,
        }
      );

      const updatedCertificate = await CERTIFICATE.findByIdAndUpdate(
        certificateID,
        {
          $set: {
            reason,
            isCertificateVerified: false,
          },
        },
        { new: true }
      );

      if (!updatedCertificate) {
        throw new Error(`Certificate with ID ${certificateID} not found`);
      }

      return updatedCertificate;
    } catch (error) {
      console.error("Error in createCertificateDenial:", error);
      throw error;
    }
  }
}

module.exports = new CertificateRepository();
