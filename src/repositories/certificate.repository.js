const CERTIFICATE = require("../models/certificate.model");
const COUPLETHERAPIST = require("../models/coupleTherapist.model");
const APIError = require("../utils/ApiError");

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
    // Find the certificate to get the coupleTherapistID
    const certificate = await CERTIFICATE.findById(certificateId);
    if (!certificate) {
      throw new APIError(404, "Certificate not found");
    }

    // Find and update the certificate in coupleTherapist document
    const coupleTherapist = await COUPLETHERAPIST.findById(
      certificate.coupleTherapistID
    );
    if (!coupleTherapist) {
      throw new APIError(404, "Couple therapist not found");
    }

    const updatedCertificates = coupleTherapist.certificates.map((cert) => {
      // Check if either the _id or the certificateID matches
      if (
        (cert._id && cert._id.toString() === certificateId) ||
        (cert.certificateID && cert.certificateID.toString() === certificateId)
      ) {
        cert.status = "approved";
        cert.processedAt = new Date();
        cert.processedBy = adminId;
      }
      return cert;
    });

    coupleTherapist.certificates = updatedCertificates;
    await coupleTherapist.save();

    // Log for debugging
    console.log(
      "Updated coupleTherapist certificates:",
      coupleTherapist.certificates
    );

    // Update the certificate in the CERTIFICATE collection
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

  async updateCertificateDenial(certificateId, reason, adminId) {
    // Find the certificate to get the coupleTherapistID
    const certificate = await CERTIFICATE.findById(certificateId);
    if (!certificate) {
      throw new APIError(404, "Certificate not found");
    }

    // Find and update the certificate in coupleTherapist document
    const coupleTherapist = await COUPLETHERAPIST.findById(
      certificate.coupleTherapistID
    );
    if (!coupleTherapist) {
      throw new APIError(404, "Couple therapist not found");
    }

    const updatedCertificates = coupleTherapist.certificates.map((cert) => {
      // Check if either the _id or the certificateID matches
      if (
        (cert._id && cert._id.toString() === certificateId) ||
        (cert.certificateID && cert.certificateID.toString() === certificateId)
      ) {
        cert.status = "denied";
        cert.denialReason = reason;
        cert.processedAt = new Date();
        cert.processedBy = adminId;
      }
      return cert;
    });

    coupleTherapist.certificates = updatedCertificates;
    await coupleTherapist.save();

    // Log for debugging
    console.log(
      "Updated coupleTherapist certificates:",
      coupleTherapist.certificates
    );

    // Update the certificate in the CERTIFICATE collection
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
