const CERTIFICATE = require("../models/certificate.model");

class CertificateRepository {
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
    return await CERTIFICATE.findByIdAndUpdate(
      certificateID,
      {
        $set: { reason },
      },
      { new: true }
    );
  }

  async deleteCertificate(certificateID) {
    return await CERTIFICATE.findByIdAndDelete(certificateID);
  }
}

module.exports = new CertificateRepository();
