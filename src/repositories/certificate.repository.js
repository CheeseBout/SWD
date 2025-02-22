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
}

module.exports = new CertificateRepository();
