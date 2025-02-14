import { check } from "express-validator";

const validateUserRegistration = [
  check("username")
    .notEmpty()
    .withMessage("Username should not be empty")
    .isAlphanumeric()
    .withMessage("Username should be alphanumeric"),

  check("email")
    .notEmpty()
    .withMessage("Email should not be empty")
    .isEmail()
    .withMessage("Invalid email format"),

  check("fullname")
    .notEmpty()
    .withMessage("Full name should not be empty")
    .isString()
    .withMessage("Full name must be a string"),

  check("password")
    .notEmpty()
    .withMessage("Password should not be empty")
    .isStrongPassword({
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })
    .withMessage(
      "Password must be at least 6 characters long and contain at least 1 uppercase letter, 1 lowercase letter, and 1 number"
    ),

  check("gender")
    .notEmpty()
    .withMessage("Gender should not be empty")
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be 'male', 'female', or 'other'"),

  check("dob")
    .notEmpty()
    .withMessage("Date of birth should not be empty")
    .isDate()
    .withMessage("Invalid date format")
    .custom((value) => {
      if (new Date(value) >= new Date()) {
        throw new Error("Date of birth must be in the past");
      }
      return true;
    }),

  check("country")
    .notEmpty()
    .withMessage("Country should not be empty")
    .isString()
    .withMessage("Country name must be a string"),
];

const validateUserLogin = [
  check("username")
    .optional()
    .isAlphanumeric()
    .withMessage("Username should be alphanumeric"),

  check("email").optional().isEmail().withMessage("Invalid email format"),

  check("password").notEmpty().withMessage("Password should not be empty"),

  check().custom((value, { req }) => {
    if (!req.body.username && !req.body.email) {
      throw new Error("Either email or username is required");
    }
    return true;
  }),
];

const validateUserSearch = [
  check("username")
    .optional()
    .isAlphanumeric()
    .withMessage("Username should be alphanumeric"),

  check("email").optional().isEmail().withMessage("Invalid email format"),

  check().custom((value, { req }) => {
    if (!req.body.username && !req.body.email) {
      throw new Error("Either email or username is required");
    }
    return true;
  }),
];

const validateChangePassword = [
  check("oldPassword").notEmpty().withMessage("Password should not be empty"),
  check("newPassword")
    .notEmpty()
    .withMessage("Password should not be empty")
    .isStrongPassword({
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })
    .withMessage(
      "Password must be at least 6 characters long and contain at least 1 uppercase letter, 1 lowercase letter, and 1 number"
    ),
];

const validateUpdateAccount = [
  check("email")
    .optional()

    .isEmail()
    .withMessage("Invalid email format"),
  check("fullname")
    .optional()

    .isString()
    .withMessage("Full name must be a string"),

  check().custom((value, { req }) => {
    if (!req.body.fullname && !req.body.email) {
      throw new Error("Either email or username is required");
    }
    return true;
  }),
];

export {
  validateUserRegistration,
  validateUserLogin,
  validateUserSearch,
  validateChangePassword,
  validateUpdateAccount,
};
