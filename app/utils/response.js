exports.responseSuccessWithData = (data) => ({ data: data });
exports.responseSuccessWithMessage = (
  message = "Congrats, Request Send With Successfully"
) => ({
  message: message,
});
exports.responseErrorWithMessage = (
  message = "Woops, Something went wrong on server"
) => ({
  message: message,
});
