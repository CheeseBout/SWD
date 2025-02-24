const APIError = require("../utils/ApiError");
const certificateRepository = require("../repositories/certificate.repository");
const coupleTherapistRepo = require("../repositories/coupleTherapist.repo");

class AdminServices {
  async approveCertificate({ certificateID, req }) {
    const userRole = req?.user?.role;
    if (userRole !== "admin") {
      throw new APIError(401, "You are not authorized to perform this action");
    }

    if (!certificateID) {
      throw new APIError(400, "Certificate ID is required");
    }

    const updatedTherapist =
      await coupleTherapistRepo.updateTherapistCertificate(certificateID);
    if (!updatedTherapist) {
      throw new APIError(400, "Certificate not found in therapist profile");
    }

    const certificate =
      await certificateRepository.updateCertificateVerification(certificateID);
    if (!certificate) {
      throw new APIError(400, "Certificate not found");
    }

    return {
      updatedTherapist,
    };
  }

  async denyCertificate({ certificateID, reason, req }) {
    const userRole = req?.user?.role;
    if (userRole !== "admin") {
      throw new APIError(401, "You are not authorized to perform this action");
    }
    const certificate = await certificateRepository.deleteCertificate(
      certificateID
    );

    if (!certificateID) {
      throw new APIError(400, "Certificate ID is required");
    }

    if (reason) {
      await certificateRepository.createCertificateDenial({
        certificateID,
        reason,
      });
    }

    if (!certificate) {
      throw new APIError(400, "Certificate not found");
    }

    return {
      message: "Certificate deny successfully",
    };
  }
}

module.exports = new AdminServices();
