import userModel from "../models/userModel";
async function registerVerify(userName: string, email: string) {
  let check = true,
    typeError = undefined,
    errorMessage = "error unknow";
  try {
    const checkEmail = userModel.findOne({ email: email });
    const checkUserName = userModel.findOne({ user_name: userName });
    const awaitVerify = await Promise.all([checkEmail, checkUserName]);
    if (awaitVerify[0]) {
      check = false;
      typeError = "Email";
      errorMessage = "Email is already been used";
    } else if (awaitVerify[1]) {
      check = false;
      typeError = "UserName";
      errorMessage = "User name is already been used";
    }
    return { check: check, ErrorMessage: errorMessage };
  } catch (error) {
    if (error instanceof Error) {
      return {
        check: false,
        TypeError: typeError,
        ErrorMessage: error.message,
      };
    } else {
      return {
        check: false,
        TypeError: typeError,
        ErrorMessage: errorMessage,
      };
    }
  }
}

export { registerVerify };
