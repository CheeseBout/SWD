class SuccessResponse {
  constructor({ message, status = 200, data = {} }) {
    this.message = message;
    this.status = status;
    this.data = data;
  }

  send(res, headers = {}) {
    return res.status(this.status).json(this);
  }
}

class Ok extends SuccessResponse {
  constructor({ message, data = {}, options = {} }) {
    super({ message, data, options });
  }
}

const OK = (res, message, data) => {
  new Ok({
    message,
    data,
  }).send(res);
};

module.exports = {
  OK,
};
