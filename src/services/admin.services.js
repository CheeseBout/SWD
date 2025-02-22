const CERTIFICATE = require("../models/certificate.model");
const COUPLETHERAPIST = require("../models/coupleTherapist.model");
const APIError = require("../utils/ApiError");

class AdminServices {
  async approveCertificate({ certificateID }) {
    // Update certificate trong couple therapist trước
    const updatedTherapist = await COUPLETHERAPIST.findOneAndUpdate(
      { "certificates.certificateID": certificateID },
      {
        $set: {
          "certificates.$[cert].isCertificateVerified": true,
        },
      },
      {
        arrayFilters: [{ "cert.certificateID": certificateID }],
        new: true,
      }
    );

    if (!updatedTherapist) {
      throw new APIError(400, "Certificate not found in therapist profile");
    }

    // Update trong collection Certificate luôn
    const certificate = await CERTIFICATE.findByIdAndUpdate(
      certificateID,
      {
        $set: { isCertificateVerified: true },
      },
      { new: true }
    );

    if (!certificate) {
      throw new APIError(400, "Certificate not found");
    }

    return {
      updatedTherapist,
    };
  }
}

module.exports = new AdminServices();
