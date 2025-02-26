const RESERVATIONRESULT = require("../models/reservation-result.model");

class ReservationResultRepo {
  async create(data) {
    return await RESERVATIONRESULT.create(data);
  }

  async findById(id) {
    return await RESERVATIONRESULT.findById(id);
  }

  async updateById(id, data) {
    return await RESERVATIONRESULT.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async deleteById(id) {
    return await RESERVATIONRESULT.findByIdAndDelete(id);
  }

  async findOne(query) {
    return await RESERVATIONRESULT.findOne(query);
  }

  async findAll() {
    return await RESERVATIONRESULT.find();
  }
}

module.exports = new ReservationResultRepo();
