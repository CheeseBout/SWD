const CERTIFICATE = require("../models/certificate.model");
const COUPLETHERAPIST = require("../models/coupleTherapist.model");

class CertificateRepository {
  async findOne(filter) {
    return await CERTIFICATE.findOne(filter);
  }

  async findCertificateById(certificateId) {
    return await CERTIFICATE.findById(certificateId).populate(
      "processedBy",
      "fullname email"
    );
  }

  async updateCertificateVerification(certificateId, adminId) {
    return await CERTIFICATE.findByIdAndUpdate(
      certificateId,
      {
        status: "approved",
        processedAt: new Date(),
        processedBy: adminId,
      },
      { new: true }
    ).populate("processedBy", "fullname email");
  }

  async createCertificateDenial(certificateId, reason, adminId) {
    return await CERTIFICATE.findByIdAndUpdate(
      certificateId,
      {
        status: "denied",
        denialReason: reason,
        processedAt: new Date(),
        processedBy: adminId,
      },
      { new: true }
    ).populate("processedBy", "fullname email");
  }

  async getAllCertificateRequests() {
    return await CERTIFICATE.find({
      status: "pending",
    }).populate();
  }
}

module.exports = new CertificateRepository();
