const APIError = require("../utils/ApiError");
const reservationsRepo = require("../repositories/reservations.repo");
const mongoose = require("mongoose");
const PAYMENT = require("../models/payment.model");
const TRANSACTION = require("../models/transaction.model");
const GoogleMeetService = require("./meet.services");

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

    const result = await reservationsRepo.getAll(filter, { page, limit });

    console.log("Therapist reservations: ", result);

    if (result.reservations && result.reservations.length > 0) {
      for (const reservation of result.reservations) {
        // Handle reservations with "confirmed" status - check if they should be marked as deposited
        if (reservation.status === "confirmed") {
          try {
            const isDeposited = await this.checkDepositedReservation(
              reservation._id
            );
            if (isDeposited) {
              // Update reservation status to deposited in the database
              await mongoose
                .model("Reservation")
                .findByIdAndUpdate(reservation._id, { status: "deposited" });

              // Update the status in the returned object as well
              reservation.status = "deposited";
              console.log(
                `Reservation ${reservation._id} updated to "deposited"`
              );
            } else {
              // Not deposited, continue to the next reservation
              continue;
            }
          } catch (error) {
            console.error(
              `Error checking/updating deposit status for reservation ${reservation._id}:`,
              error
            );
            continue;
          }
        }
      }
    }

    return await reservationsRepo.getAll(filter, { page, limit });
  }

  async createReservation(req) {
    const data = req.body;
    if (req.user.role !== "member") {
      throw new APIError(403, "Permission denied");
    }

    // Validate required fields
    if (!data.packageID) {
      throw new APIError(400, "Package ID is required");
    }

    // Validate and convert IDs to ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
      throw new APIError(400, "Invalid userId");
    }
    if (!mongoose.Types.ObjectId.isValid(data.coupleTherapistID)) {
      throw new APIError(400, "Invalid coupleTherapistID");
    }
    if (!mongoose.Types.ObjectId.isValid(data.packageID)) {
      throw new APIError(400, "Invalid packageID");
    }

    data.userID = new mongoose.Types.ObjectId(req.user._id);
    data.coupleTherapistID = new mongoose.Types.ObjectId(
      data.coupleTherapistID
    );
    data.packageID = new mongoose.Types.ObjectId(data.packageID);

    // Format date strings consistently to avoid issues
    try {
      data.startTime = new Date(data.startTime).toISOString();
      data.endTime = new Date(data.endTime).toISOString();
    } catch (error) {
      throw new APIError(400, "Invalid date format: " + error.message);
    }

    // Check for duplicate reservation
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

    // Get package details and set the total price
    try {
      const packageDetails = await mongoose
        .model("Package")
        .findById(data.packageID);
      if (!packageDetails) {
        throw new APIError(404, "Selected package not found");
      }

      // Check if this package belongs to the selected therapist
      if (
        packageDetails.coupleTherapistID.toString() !==
        data.coupleTherapistID.toString()
      ) {
        throw new APIError(
          400,
          "The selected package does not belong to this therapist"
        );
      }

      // Check if the package is active
      if (!packageDetails.isActive) {
        throw new APIError(
          400,
          "The selected package is not currently available"
        );
      }

      // Apply discount to get final price
      const discountAmount =
        packageDetails.price * (packageDetails.discount / 100);
      data.totalPrice = packageDetails.price - discountAmount;

      console.log(
        `Setting reservation price to ${data.totalPrice} from package ${packageDetails.name}`
      );
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      console.error("Error fetching package details:", error);
      throw new APIError(500, "Error processing package information");
    }

    try {
      // Create the reservation
      const reservation = await reservationsRepo.createReservation(data);
      console.log("Reservation created successfully:", reservation);

      // Update availability status to occupied - pass both slot and record
      await reservationsRepo.updateAvailability(
        data.coupleTherapistID,
        data.startTime,
        data.endTime,
        availabilityCheck.availableSlot,
        availabilityCheck.availabilityRecord
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

  async getReservationsByTherapist(therapistID, options = {}) {
    // Extract the user from options
    const { user, status, page, limit } = options;

    // Check if the requesting user has permission to view these reservations
    // Allow admin or if the user is the therapist themselves
    const isOwner =
      user.therapistInfo &&
      user.therapistInfo._id.toString() === therapistID.toString();

    if (user.role !== "admin" && user.role !== "couple_therapist" && !isOwner) {
      throw new APIError(
        403,
        "Permission denied - you can only view your own therapist reservations"
      );
    }

    // Validate the therapistID
    if (!mongoose.Types.ObjectId.isValid(therapistID)) {
      throw new APIError(400, "Invalid therapist ID format");
    }

    // Check if the therapist exists
    const therapistExists = await reservationsRepo.checkTherapistExists(
      therapistID
    );
    if (!therapistExists) {
      throw new APIError(404, "Therapist not found");
    }

    // Create filter object
    const filter = {
      coupleTherapistID: new mongoose.Types.ObjectId(therapistID),
    };

    // Add status filter if provided
    if (status) {
      filter.status = status;
    }

    const result = await reservationsRepo.getAll(filter, { page, limit });

    console.log("Therapist reservations: ", result);

    // Process each reservation to check and update deposit status
    if (result.reservations && result.reservations.length > 0) {
      for (const reservation of result.reservations) {
        // Handle reservations with "confirmed" status - check if they should be marked as deposited
        if (reservation.status === "confirmed") {
          try {
            const isDeposited = await this.checkDepositedReservation(
              reservation._id
            );
            if (isDeposited) {
              // Update reservation status to deposited in the database
              await mongoose
                .model("Reservations")
                .findByIdAndUpdate(reservation._id, { status: "deposited" });

              // Update the status in the returned object as well
              reservation.status = "deposited";
              console.log(
                `Reservation ${reservation._id} updated to "deposited"`
              );
            } else {
              // Not deposited, continue to the next reservation
              continue;
            }
          } catch (error) {
            console.error(
              `Error checking/updating deposit status for reservation ${reservation._id}:`,
              error
            );
            continue;
          }
        }

        // For all deposited reservations (newly updated or already deposited),
        // check if they need a meeting URL
        if (reservation.status === "deposited") {
          // Skip if the reservation already has a meeting URL
          if (reservation.meetingURL && reservation.meetingURL.trim() !== "") {
            console.log(
              `Reservation ${reservation._id} already has meeting URL: ${reservation.meetingURL}`
            );
            continue;
          }

          // Create meeting link for the deposited reservation
          try {
            // Get user email for the meeting invitation
            const userInfo = await reservationsRepo.findUserEmail(
              reservation.userID
            );

            if (!userInfo || !userInfo.email) {
              console.error(
                `Cannot create meeting: User email not found for reservation ${reservation._id}`
              );
              continue;
            }

            // Create the meeting
            console.log("Creating meeting for reservation:", reservation._id);
            const meetingDetails = await GoogleMeetService.createMeeting({
              startTime: reservation.startTime,
              endTime: reservation.endTime,
              userId: user._id, // Using the therapist's ID for creating the meeting
              email: userInfo.email,
            });

            console.log("Meeting service response:", meetingDetails);

            // Check if there was an auth error
            if (meetingDetails.error && meetingDetails.requireGoogleAuth) {
              console.log(
                "Google authentication required:",
                meetingDetails.message
              );
              // Add auth error information to the response
              if (!result.authError) {
                result.authError = {
                  message: meetingDetails.message,
                  googleAuthUrl: meetingDetails.googleAuthUrl,
                };
              }
              // Skip further meeting creation attempts
              authErrorOccurred = true;
              continue;
            }

            // Only proceed if we have a valid meeting link
            if (meetingDetails && meetingDetails.meetLink) {
              // Update the reservation with the meeting URL in database
              const updatedReservation = await mongoose
                .model("Reservation")
                .findByIdAndUpdate(
                  reservation._id,
                  { meetingURL: meetingDetails.meetLink },
                  { new: true } // This returns the updated document
                );

              console.log("Updated reservation:", updatedReservation);

              // Update the returned object as well
              reservation.meetingURL = meetingDetails.meetLink;
              console.log(
                `Meeting created for reservation ${reservation._id}: ${meetingDetails.meetLink}`
              );
            } else {
              console.error(
                `No meetLink received for reservation ${reservation._id}`
              );
            }
          } catch (meetingError) {
            console.error(
              `Error creating meeting for reservation ${reservation._id}:`,
              meetingError
            );
          }
        }
      }
    }

    return result;
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

  async approveReservation(reservationID, user) {
    console.log("User: ", user);
    if (user.role !== "couple_therapist") {
      throw new APIError(403, "Permission denied");
    }

    // Get reservation first to access user details
    const existingReservation = await reservationsRepo.getReservationById(
      reservationID
    );
    if (!existingReservation) throw new APIError(404, "Reservation not found");

    // Approve the reservation - no price needed as it's already set from package
    const reservation = await reservationsRepo.approveReservation(
      reservationID
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

        // Format the price from the reservation's totalPrice
        const formattedPrice = existingReservation.totalPrice
          ? existingReservation.totalPrice.toLocaleString("vi-VN") + " VND"
          : "To be determined";

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
              <p style="margin: 10px 0;"><strong>Price:</strong> ${formattedPrice}</p>
            </div>
            <p style="color: #666; font-size: 14px; text-align: center;">Please be available at the scheduled time. We look forward to helping you.</p>
          </div>
        `;

        await emailService.sendEmail(
          userInfo.email,
          "Reservation Confirmed - Marriage Counseling Session",
          `Your reservation for ${startTime.toLocaleString(
            "vi-VN"
          )} has been confirmed. Price: ${formattedPrice}`,
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

  async checkDepositedReservation(reservationId) {
    const payment = await PAYMENT.findOne({ reservation: reservationId });
    if (!payment) {
      return false;
    }

    console.log("Payment", payment);
    const paymentID = payment._id;
    console.log("Payment ID", paymentID);

    const transaction = await TRANSACTION.findOne({
      payment: paymentID,
      status: "PAID",
    });

    if (!transaction) {
      return false;
    }

    console.log("Transaction", transaction);
    console.log("Transaction status", transaction.status);

    return transaction.status === "PAID";
  }
}

module.exports = new ReservationService();
