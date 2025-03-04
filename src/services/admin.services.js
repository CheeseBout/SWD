const APIError = require("../utils/ApiError");
const certificateRepository = require("../repositories/certificate.repository");
const coupleTherapistRepo = require("../repositories/coupleTherapist.repo");

class AdminServices {
  async manageCertificate({ certificateID, req, action, reason }) {
    const userRole = req?.user?.role;
    const certificateStatus = await certificateRepository.findCertificateById(
      certificateID
    );
    console.log(certificateStatus?.isCertificateVerified);
    if (!certificateID || !action) {
      throw new APIError(
        400,
        "Certificate ID, request, and action are required"
      );
    }
    if (userRole !== "admin") {
      throw new APIError(401, "You are not authorized to perform this action");
    }

    if (action === "approve") {
      //Check if the certificates is already verified
      if (certificateStatus?.isCertificateVerified === true) {
        throw new APIError(400, "Certificate already verified");
      }
      const updatedTherapist =
        await coupleTherapistRepo.updateTherapistCertificate(certificateID);
      if (!updatedTherapist) {
        throw new APIError(400, "Certificate not found in therapist profile");
      }

      const certificate =
        await certificateRepository.updateCertificateVerification(
          certificateID
        );
      if (!certificate) {
        throw new APIError(400, "Certificate not found");
      }

      return {
        updatedTherapist,
      };
    } else if (action === "deny") {
      //Check if the certificates is already denied
      if (certificateStatus?.isCertificateVerified === false) {
        throw new APIError(400, "Certificate already denied");
      }

      if (!certificateID) {
        throw new APIError(400, "Certificate not found");
      }
      if (reason) {
        await certificateRepository.createCertificateDenial({
          certificateID,
          reason,
        });
      }

      return {
        message: "Certificate deny successfully",
      };
    }
  }
}

module.exports = new AdminServices();
