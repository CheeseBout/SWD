const COUPLETHERAPIST_AVAILABILITY = require("../models/coupleTherapistAvailability.model");
const RESERVATIONRESULT = require("../models/reservation-result.model");
const RESERVATION = require("../models/reservation.model");
const USER = require("../models/user.model");

class ReservationRepo {
  async getAll(filter, options) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    // First get the reservations
    const reservations = await RESERVATION.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ updatedAt: -1 }) // Add this line to sort by updatedAt descending
      .populate("userID", "fullname photoURL")
      .populate({
        path: "coupleTherapistID",
        select: "userID", // Get the userID from the coupleTherapist model
        populate: {
          path: "userID", // Then populate that userID
          select: "fullname photoURL", // And get the fullname and photoURL from the user model
        },
      })
      .populate("packageID", "name price");

    // Transform the data to have the therapist's user info at the coupleTherapistID level
    const transformedReservations = await Promise.all(
      reservations.map(async (reservation) => {
        const reservationObj = reservation.toObject();

        // If coupleTherapistID has a populated userID with data
        if (
          reservationObj.coupleTherapistID &&
          reservationObj.coupleTherapistID.userID
        ) {
          // Restructure to move user properties up to coupleTherapistID level
          reservationObj.coupleTherapistID = {
            _id: reservationObj.coupleTherapistID._id,
            fullname: reservationObj.coupleTherapistID.userID.fullname,
            photoURL: reservationObj.coupleTherapistID.userID.photoURL,
          };
        }

        // Find the associated reservation result
        const reservationResult = await RESERVATIONRESULT.findOne({
          reservationID: reservation._id,
        });

        console.log("Reservation result:", reservationResult);

        // Add reservation result information if it exists
        if (reservationResult) {
          reservationObj.reservationResult = {
            _id: reservationResult._id,
            status: reservationResult.status,
            // sessionSummary: reservationResult.sessionSummary,
            // issuesIdentified: reservationResult.issuesIdentified,
            // therapistRecommendations:
            //   reservationResult.therapistRecommendations,
            // homeworkAssignment: reservationResult.homeworkAssignment,
          };
        } else {
          reservationObj.reservationResult = null;
        }

        return reservationObj;
      })
    );

    const total = await RESERVATION.countDocuments(filter);

    return {
      reservations: transformedReservations,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async getReservationById(id) {
    return await RESERVATION.findById(id)
      .populate("userID", "fullname photoURL")
      .populate("coupleTherapistID", "fullname photoURL")
      .populate("packageID", "name price");
  }

  async createReservation(reservationData) {
    const reservation = await RESERVATION.create(reservationData);
    return await reservation.save();
  }

  async getReservationById(id) {
    return await RESERVATION.findById(id)
      .populate("userID", "fullname")
      .populate("coupleTherapistID", "fullname")
      .populate("packageID", "name price");
  }

  async updateReservation(id, updateData) {
    return await RESERVATION.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteReservation(id) {
    return await RESERVATION.findByIdAndUpdate(
      id,
      { status: "canceled" },
      { new: true }
    );
  }

  async findExistingReservation(userID, therapistID, startTime, endTime) {
    return await RESERVATION.findOne({
      userID,
      coupleTherapistID: therapistID,
      startTime,
      endTime,
    });
  }

  async findReservationByCode(reservationID) {
    return await RESERVATION.findById(reservationID);
  }

  async approveReservation(reservationID) {
    try {
      return await RESERVATION.findByIdAndUpdate(
        reservationID,
        {
          status: "confirmed",
        },
        { new: true }
      );
    } catch (error) {
      console.error(`Error approving reservation ${reservationID}:`, error);
      return null;
    }
  }

  async denyReservation(reservationID, reason) {
    return await RESERVATION.findByIdAndUpdate(
      reservationID,
      { status: "denied", reason: reason },
      { new: true }
    );
  }

  async checkDuplicate(therapistID, startTime, endTime, reservationID) {
    return await RESERVATION.findOne({
      coupleTherapistID: therapistID,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
      _id: { $ne: reservationID },
      status: { $nin: ["canceled", "denied"] },
    });
  }
  async checkOccupied(therapistID, startTime, endTime) {
    // Instead of finding just one availability record, get all records for this therapist
    const availabilityRecords = await COUPLETHERAPIST_AVAILABILITY.find({
      coupleTherapistID: therapistID,
    });

    if (!availabilityRecords || availabilityRecords.length === 0) {
      throw new Error("Therapist availability not found");
    }

    // Convert startTime and endTime to Date objects
    startTime = new Date(startTime);
    endTime = new Date(endTime);

    console.log(
      `Found ${availabilityRecords.length} availability records for therapist ${therapistID}`
    );
    console.log("Input start time:", startTime);
    console.log("Input end time:", endTime);

    // Loop through all availability records to find a matching slot
    for (const availability of availabilityRecords) {
      console.log(`Checking availability record: ${availability._id}`);

      for (const available of availability.timeAvailable) {
        console.log("Checking available slot:", available);
        console.log("Available start hour:", available.startHour);
        console.log("Available end hour:", available.endHour);

        // Check if startTime and endTime exactly match the timeAvailable slot
        const startTimeMatches =
          startTime.getTime() === available.startHour.getTime();
        const endTimeMatches =
          endTime.getTime() === available.endHour.getTime();

        console.log("Start time matches:", startTimeMatches);
        console.log("End time matches:", endTimeMatches);

        if (startTimeMatches && endTimeMatches && !available.isOccupied) {
          console.log("Found exact match and slot is not occupied!");
          return {
            isOccupied: false,
            availableSlot: available,
            availabilityRecord: availability, // Return the parent record too
          };
        }
      }
    }

    // No matching available slot found
    console.log("No matching available time slot found across all records");
    return { isOccupied: true, availableSlot: null };
  }

  async updateAvailability(
    therapistID,
    startTime,
    endTime,
    availableSlot = null,
    availabilityRecord = null
  ) {
    // If an availability record was provided, use that directly
    const availability =
      availabilityRecord ||
      (await COUPLETHERAPIST_AVAILABILITY.findOne({
        coupleTherapistID: therapistID,
      }));

    if (!availability) {
      throw new Error("Therapist availability not found");
    }

    // Convert startTime and endTime to Date objects
    startTime = new Date(startTime);
    endTime = new Date(endTime);

    console.log(
      "Updating availability for slot with start:",
      startTime,
      "end:",
      endTime,
      "in record:",
      availability._id
    );

    if (availableSlot) {
      // If an available slot was provided, update it directly
      for (const available of availability.timeAvailable) {
        if (available._id.toString() === availableSlot._id.toString()) {
          console.log("Updating specific slot:", available);
          available.isOccupied = true;
          break;
        }
      }
    } else {
      // Otherwise find by matching start and end times exactly
      for (const available of availability.timeAvailable) {
        const startTimeMatches =
          startTime.getTime() === available.startHour.getTime();
        const endTimeMatches =
          endTime.getTime() === available.endHour.getTime();

        if (startTimeMatches && endTimeMatches) {
          console.log("Found matching slot to update:", available);
          available.isOccupied = true;
          break;
        }
      }
    }

    await availability.save();
    console.log("Availability updated successfully");
  }

  async findUserEmail(userID) {
    return await USER.findById(userID).select("email");
  }

  async revertAvailability(therapistID, startTime, endTime) {
    // Convert startTime and endTime to Date objects if they aren't already
    startTime = new Date(startTime);
    endTime = new Date(endTime);

    // Find all availability records for this therapist
    const availabilityRecords = await COUPLETHERAPIST_AVAILABILITY.find({
      coupleTherapistID: therapistID,
    });

    if (!availabilityRecords || availabilityRecords.length === 0) {
      console.log("Therapist availability not found for:", therapistID);
      return false;
    }

    console.log(`Found ${availabilityRecords.length} availability records`);

    let foundMatch = false;

    // Loop through all availability records to find a matching slot
    for (const availability of availabilityRecords) {
      for (const slot of availability.timeAvailable) {
        // Check for exact match of start and end times
        const startTimeMatches =
          startTime.getTime() === slot.startHour.getTime();
        const endTimeMatches = endTime.getTime() === slot.endHour.getTime();

        if (startTimeMatches && endTimeMatches) {
          console.log("Found matching slot to revert:", slot);

          // Set the slot as not occupied
          slot.isOccupied = false;

          // Save the changes
          await availability.save();
          console.log("Availability successfully reverted");

          foundMatch = true;
          return true;
        }
      }
    }

    if (!foundMatch) {
      console.log("No matching time slot found for reverting availability");
      return false;
    }
  }

  async checkUserExists(userID) {
    const user = await USER.findById(userID);
    return !!user; // Returns true if user exists, false otherwise
  }

  async checkTherapistExists(therapistID) {
    const COUPLETHERAPIST = require("../models/coupleTherapist.model");
    const therapist = await COUPLETHERAPIST.findById(therapistID);
    return !!therapist; // Returns true if therapist exists, false otherwise
  }

  async verifyPackageOwnership(packageId, therapistId) {
    try {
      const PACKAGE = require("../models/package.model");
      const pack = await PACKAGE.findOne({
        _id: packageId,
        coupleTherapistID: therapistId,
        isActive: true,
      });
      return !!pack; // Returns true if package exists and belongs to therapist
    } catch (error) {
      console.error("Error verifying package ownership:", error);
      return false;
    }
  }

  // Add method to calculate final price after discount
  async calculatePackagePrice(packageId) {
    try {
      const pack = await PACKAGE.findById(packageId);
      if (!pack) return null;

      // Calculate price after discount
      const discountAmount = pack.price * (pack.discount / 100);
      const finalPrice = pack.price - discountAmount;

      return {
        originalPrice: pack.price,
        discountPercentage: pack.discount,
        discountAmount: discountAmount,
        finalPrice: finalPrice,
      };
    } catch (error) {
      console.error("Error calculating package price:", error);
      return null;
    }
  }

  async updateById(id, data) {
    return await RESERVATION.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }
}

module.exports = new ReservationRepo();
