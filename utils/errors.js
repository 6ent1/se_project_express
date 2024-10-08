const ERROR_CODES = {
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  DUPLICATE_EMAIL: 409,
  AUTHENTICATION_ERROR: 401,
};

const ERROR_MESSAGES = {
  BAD_REQUEST:
    "the server cannot or will not process the request due to something that is perceived to be a client error ",
  FORBIDDEN: "This is a permissions issue",
  NOT_FOUND:
    "a server response that indicates the requested page could not be found",
  SERVER_ERROR: "An error has occurred on the server",
  ExistingUser: "User with this email already exists",
  AuthenticationError: "Could not authenticate the user",
  CastError: "Information entered is not valid",
};

module.exports = {
  ERROR_CODES,
  ERROR_MESSAGES,
};
