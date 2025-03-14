const APIError = require("../utils/ApiError");
const certificateRepository = require("../repositories/certificate.repository");
const coupleTherapistRepo = require("../repositories/coupleTherapist.repo");
const emailServices = require("../services/email.services");
const userRepo = require("../repositories/user.repo");

class AdminServices {
  async manageCertificate({ certificateID, req, action, reason }) {
    const userRole = req?.user?.role;
    const certificate = await certificateRepository.findCertificateById(
      certificateID
    );

    if (!certificateID || !action) {
      throw new APIError(
        400,
        "Certificate ID, request, and action are required"
      );
    }

    if (userRole !== "admin") {
      throw new APIError(401, "You are not authorized to perform this action");
    }

    // Check if certificate exists
    if (!certificate) {
      throw new APIError(404, "Certificate not found");
    }

    // Check if certificate has already been processed
    if (certificate.status !== "pending") {
      throw new APIError(
        400,
        `Certificate has already been ${certificate.status}. No further actions allowed`
      );
    }

    const therapist = await coupleTherapistRepo.findTherapistByCertificateId(
      certificateID
    );
    if (!therapist) {
      throw new APIError(404, "Therapist not found");
    }

    const user = await userRepo.getByID(therapist.userID);
    if (!user) {
      throw new APIError(404, "User not found");
    }

    if (action === "approve") {
      const updatedTherapist =
        await coupleTherapistRepo.updateTherapistCertificate(certificateID);
      if (!updatedTherapist) {
        throw new APIError(400, "Certificate not found in therapist profile");
      }

      const updatedCertificate =
        await certificateRepository.updateCertificateVerification(
          certificateID,
          req.user._id
        );

      // Send approval email
      await emailServices.sendCertificateStatus({
        email: user.email,
        certificateTitle: certificate.title,
        status: "approved",
      });

      return {
        message: "Certificate approved successfully",
        updatedTherapist,
        certificate: updatedCertificate,
      };
    } else if (action === "deny") {
      if (!reason) {
        throw new APIError(400, "Reason is required for denying a certificate");
      }

      const updatedCertificate =
        await certificateRepository.createCertificateDenial(
          certificateID,
          reason,
          req.user._id
        );

      // Send denial email
      await emailServices.sendCertificateStatus({
        email: user.email,
        certificateTitle: certificate.title,
        status: "denied",
        reason,
      });

      return {
        message: "Certificate denied successfully",
        certificate: updatedCertificate,
      };
    } else {
      throw new APIError(
        400,
        "Invalid action. Must be either 'approve' or 'deny'"
      );
    }
  }

  async getAllCertificateRequests(req) {
    const userRole = req?.user?.role;

    if (userRole !== "admin") {
      throw new APIError(401, "You are not authorized to perform this action");
    }

    return await certificateRepository.getAllCertificateRequests();
  }


}

module.exports = new AdminServices();
