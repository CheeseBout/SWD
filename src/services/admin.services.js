const APIError = require("../utils/ApiError");
const certificateRepository = require("../repositories/certificate.repository");
const coupleTherapistRepo = require("../repositories/coupleTherapist.repo");

class AdminServices {
  async approveCertificate({ certificateID }) {
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
}

module.exports = new AdminServices();
