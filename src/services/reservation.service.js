const APIError = require("../utils/ApiError");
const reservationsRepo = require("../repositories/reservations.repo");
const mongoose = require("mongoose");

class ReservationService {
  async getAllReservations(filter) {
    return await reservationsRepo.getAll(filter, {});
  }

  async getReservationById(reservationID) {
    const reservation = await reservationsRepo.getReservationById(
      reservationID
    );
    if (!reservation) throw new APIError(404, "Reservation not found");
    return reservation;
  }

  async getReservationsByUser(userID, options = {}) {
    // Extract the user from options
    const { user, status, page, limit } = options;

    // Check if the requesting user has permission to view these reservations
    if (user.role !== "member") {
      throw new APIError(403, "Permission denied");
    }

    // Validate the userID
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      throw new APIError(400, "Invalid user ID");
    }

    // Check if the user exists
    const userExists = await reservationsRepo.checkUserExists(userID);
    if (!userExists) {
      throw new APIError(404, "User not found");
    }

    // Create filter object
    const filter = { userID: new mongoose.Types.ObjectId(userID) };

    // Add status filter if provided
    if (status) {
      filter.status = status;
    }

    return await reservationsRepo.getAll(filter, { page, limit });
  }

  async createReservation(req) {
    const data = req.body;
    if (req.user.role !== "member") {
      throw new APIError(403, "Permission denied");
    }

    // Validate and convert IDs to ObjectId
    if (!mongoose.Types.ObjectId.isValid(data.userID)) {
      throw new APIError(400, "Invalid userId");
    }
    if (!mongoose.Types.ObjectId.isValid(data.coupleTherapistID)) {
      throw new APIError(400, "Invalid coupleTherapistID");
    }
    data.userID = new mongoose.Types.ObjectId(data.userID);
    data.coupleTherapistID = new mongoose.Types.ObjectId(
      data.coupleTherapistID
    );

    const isDuplicate = await reservationsRepo.checkDuplicate(
      data.coupleTherapistID,
      data.startTime,
      data.endTime
    );
    if (isDuplicate) throw new APIError(400, "Duplicate reservation");

    // Check if the time slot is available
    const availabilityCheck = await reservationsRepo.checkOccupied(
      data.coupleTherapistID,
      data.startTime,
      data.endTime
    );

    console.log("Availability check result:", availabilityCheck);

    if (availabilityCheck.isOccupied) {
      throw new APIError(
        400,
        "Therapist is not available at the requested time"
      );
    }

    try {
      // Create the reservation
      const reservation = await reservationsRepo.createReservation(data);
      console.log("Reservation created successfully:", reservation);

      // Update availability status to occupied
      await reservationsRepo.updateAvailability(
        data.coupleTherapistID,
        data.startTime,
        data.endTime,
        availabilityCheck.availableSlot
      );

      return reservation;
    } catch (error) {
      console.error("Error creating reservation:", error);
      throw new APIError(500, `Error creating reservation: ${error.message}`);
    }
  }

  async updateReservation(req) {
    const { reservationID } = req.params;
    const data = req.body;
    if (req.user.role !== "member") {
      throw new APIError(403, "Permission denied");
    }

    // Validate and convert IDs to ObjectId
    if (!mongoose.Types.ObjectId.isValid(data.coupleTherapistID)) {
      throw new APIError(400, "Invalid coupleTherapistID");
    }
    data.coupleTherapistID = new mongoose.Types.ObjectId(
      data.coupleTherapistID
    );

    const reservation = await this.getReservationById(reservationID);
    if (!reservation) throw new APIError(404, "Reservation not found");

    if (reservation.status === "confirmed") {
      throw new APIError(400, "Reservation already approved");
    }

    const isDuplicate = await reservationsRepo.checkDuplicate(
      data.coupleTherapistID,
      data.startTime,
      data.endTime,
      reservationID
    );
    if (isDuplicate) throw new APIError(400, "Duplicate reservation");

    return await reservationsRepo.updateReservation(reservationID, data);
  }

  async cancelReservation(reservationID, user) {
    if (user.role !== "member") {
      throw new APIError(403, "Permission denied");
    }

    // First, get the reservation to access its details
    const reservation = await reservationsRepo.getReservationById(
      reservationID
    );
    if (!reservation) throw new APIError(404, "Reservation not found");

    // Check if it's already canceled
    if (reservation.status === "canceled") {
      throw new APIError(400, "Reservation is already canceled");
    }

    // Cancel the reservation by updating its status
    const canceledReservation = await reservationsRepo.deleteReservation(
      reservationID
    );
    if (!canceledReservation) {
      throw new APIError(500, "Failed to cancel reservation");
    }

    console.log("Reservation canceled successfully:", canceledReservation);

    // Update the therapist availability
    try {
      const availabilityUpdated = await reservationsRepo.revertAvailability(
        reservation.coupleTherapistID,
        reservation.startTime,
        reservation.endTime
      );

      console.log("start time", reservation.startTime);
      console.log("end time", reservation.endTime);

      if (availabilityUpdated) {
        console.log("Availability successfully reverted after cancellation");
      } else {
        console.warn("No availability slot was updated during cancellation");
      }
    } catch (error) {
      console.error("Error reverting availability:", error);
    }

    return canceledReservation;
  }

  async approveReservation(reservationID, price, user) {
    console.log("User: ", user);
    if (user.role !== "couple_therapist") {
      throw new APIError(403, "Permission denied");
    }

    // Get reservation first to access user details
    const existingReservation = await reservationsRepo.getReservationById(
      reservationID
    );
    if (!existingReservation) throw new APIError(404, "Reservation not found");

    // Approve the reservation
    const reservation = await reservationsRepo.approveReservation(
      reservationID,
      price
    );
    if (!reservation) throw new APIError(404, "Reservation not found");

    // Send email notification to the user
    try {
      const userInfo = await reservationsRepo.findUserEmail(
        existingReservation.userID
      );
      if (userInfo && userInfo.email) {
        const emailService = require("./email.services");

        const startTime = new Date(existingReservation.startTime);
        const endTime = new Date(existingReservation.endTime);

        // Simplified email without payment link
        const sentMailHTML = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #28a745; text-align: center;">Reservation Confirmed</h2>
            <div style="margin: 20px 0; padding: 15px; background-color: #d4edda; border-radius: 4px;">
              <p style="margin: 10px 0;">Your counseling session reservation has been confirmed by the therapist.</p>
              <p style="margin: 10px 0;"><strong>Start Time:</strong> ${startTime.toLocaleString(
                "vi-VN"
              )}</p>
              <p style="margin: 10px 0;"><strong>End Time:</strong> ${endTime.toLocaleString(
                "vi-VN"
              )}</p>
              <p style="margin: 10px 0;"><strong>Price:</strong> ${
                price
                  ? price.toLocaleString("vi-VN") + " VND"
                  : "To be determined"
              }</p>
            </div>
            <p style="color: #666; font-size: 14px; text-align: center;">Please be available at the scheduled time. We look forward to helping you.</p>
          </div>
        `;

        await emailService.sendEmail(
          userInfo.email,
          "Reservation Confirmed - Marriage Counseling Session",
          `Your reservation for ${startTime.toLocaleString(
            "vi-VN"
          )} has been confirmed. Price: ${
            price ? price.toLocaleString("vi-VN") + " VND" : "To be determined"
          }`,
          sentMailHTML
        );

        console.log(
          `Confirmation notification email sent to ${userInfo.email}`
        );
      } else {
        console.warn("Could not find user email for sending notification");
      }
    } catch (error) {
      console.error("Failed to send email notification:", error);
    }

    // Just return the reservation without payment information
    return reservation;
  }

  async denyReservation(reservationID, reason, user) {
    if (user.role !== "couple_therapist") {
      throw new APIError(403, "Permission denied");
    }

    if (!reason) throw new APIError(400, "Reason is required");

    // Get reservation first to access user details and revert availability
    const existingReservation = await reservationsRepo.getReservationById(
      reservationID
    );
    if (!existingReservation) throw new APIError(404, "Reservation not found");

    // Deny the reservation
    const reservation = await reservationsRepo.denyReservation(
      reservationID,
      reason
    );
    if (!reservation) throw new APIError(404, "Reservation not found");

    // Update the therapist availability
    try {
      const availabilityUpdated = await reservationsRepo.revertAvailability(
        existingReservation.coupleTherapistID,
        existingReservation.startTime,
        existingReservation.endTime
      );

      console.log("start time", existingReservation.startTime);
      console.log("end time", existingReservation.endTime);

      if (availabilityUpdated) {
        console.log("Availability successfully reverted after denial");
      } else {
        console.warn("No availability slot was updated during denial");
      }
    } catch (error) {
      console.error("Error reverting availability:", error);
      // Don't throw error here since the reservation was successfully denied
    }

    // Send email notification to the user
    try {
      const userInfo = await reservationsRepo.findUserEmail(
        existingReservation.userID
      );
      if (userInfo && userInfo.email) {
        const emailService = require("./email.services");

        const startTime = new Date(existingReservation.startTime);
        const endTime = new Date(existingReservation.endTime);

        const sentMailHTML = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #dc3545; text-align: center;">Reservation Denied</h2>
            <div style="margin: 20px 0; padding: 15px; background-color: #f8d7da; border-radius: 4px;">
              <p style="margin: 10px 0;">Your counseling session reservation has been denied by the therapist.</p>
              <p style="margin: 10px 0;"><strong>Start Time:</strong> ${startTime.toLocaleString(
                "vi-VN"
              )}</p>
              <p style="margin: 10px 0;"><strong>End Time:</strong> ${endTime.toLocaleString(
                "vi-VN"
              )}</p>
              <p style="margin: 10px 0;"><strong>Reason for denial:</strong> ${reason}</p>
            </div>
            <p style="color: #666; font-size: 14px; text-align: center;">You can make a new reservation with a different time slot.</p>
          </div>
        `;

        await emailService.sendEmail(
          userInfo.email,
          // "tribao5556@gmail.com",
          "Reservation Denied - Marriage Counseling Session",
          `Your reservation for ${startTime.toLocaleString(
            "vi-VN"
          )} has been denied. Reason: ${reason}`,
          sentMailHTML
        );

        console.log(`Denial notification email sent to ${userInfo.email}`);
      } else {
        console.warn("Could not find user email for sending notification");
      }
    } catch (error) {
      console.error("Failed to send email notification:", error);
      // Don't throw error here since the reservation was successfully denied
    }

    return reservation;
  }
}

module.exports = new ReservationService();
