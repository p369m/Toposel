import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import { validationResult, matchedData } from "express-validator";

const generateAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    await user.save({ ValidateBeforeSave: false });
    return { accessToken };
  } catch (error) {
    throw new apiError(500, "server error");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const { username, email, fullname, password, gender, dob, country } =
    matchedData(req);
  if (
    [username, email, fullname, password, gender, dob, country].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new apiError(400, "All fields are required");
  }

  const checkExistedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (checkExistedUser) {
    throw new apiError(409, "username or email already exists");
  }

  const user = await User.create({
    fullname,
    email,
    password,
    gender,
    dob,
    country,
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user._id).select("-password");
  if (!createdUser) {
    throw new apiError(500, "server error while registering the user");
  }
  return res
    .status(201)
    .json(new apiResponse(200, createdUser, "user registrated successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const { username, email, password } = matchedData(req);
  console.log(username, email, password);
  if (!(username || email)) {
    throw new apiError(400, "email or username required");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new apiError(404, "user does not exist");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new apiError(404, "user or password wrong");
  }
  const { accessToken } = await generateAccessToken(user._id);
  const loggedInUser = await User.findById(user._id).select("-password ");
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new apiResponse(
        200,
        { user: loggedInUser, accessToken },
        "user logged in"
      )
    );
});

const searchUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const { username, email } = matchedData(req);
  if (!(username || email)) {
    throw new apiError(400, "email or username required");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  }).select("-password ");
  if (!user) {
    throw new apiError(404, "user does not exist");
  }
  return res
    .status(200)
    .json(new apiResponse(200, { user: user }, "user found"));
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findById(req.user._id);
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .json(new apiResponse(200, {}, "user logged out"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const { oldPassword, newPassword } = matchedData(req);
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new apiError(400, "wrong password");
  }
  user.password = newPassword;
  await user.save({ ValidateBeforeSave: false });
  return res
    .status(200)
    .json(new apiResponse(200, {}, "password change success"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { user: req.user },
        "current user fetched successfully"
      )
    );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const { fullname, email } = matchedData(req);
  if (!(fullname || email)) {
    throw new apiError(400, "details expected");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new apiResponse(200, { user }, "details updated"));
});

export {
  registerUser,
  loginUser,
  searchUser,
  logoutUser,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
};
