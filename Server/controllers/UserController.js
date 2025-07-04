const User = require("../models/User");
const sendToken = require("../utils/jwtToken");
const File = require("../utils/cloudinary");

exports.register = async (req, res, next) => {
  try {
    const file = req.file;

    if (!file) return res.status(400).send("No image in the request");

    req.body.avatar = await File.uploadSingle({ filePath: file.path });

    console.log(req.body);

    const user = await User.create(req.body);

    if (!user) {
      return res.status(400).send("the user cannot be created!");
    }

    return sendToken(user, 200, res, "Success");
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: "Please try again later",
      success: false,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email & password" });
    }

    let user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    const passwordMatched = await user.comparePassword(password);

    if (!passwordMatched) {
      return res.status(401).json({ message: "Invalid Email or Password" });
    }

    user = await User.findOne(user._id);
    await user.setActive(); // Set user as active
    sendToken(user, 200, res, "Successfully Login");
  } catch (err) {
    return res.status(400).json({
      message: "Please try again later",
      success: false,
    });
  }
};

exports.getSingleUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    res.json({
      user,
      success: true,
    });
  } catch (err) {
    return res.status(400).json({
      message: "Please try again later",
      success: false,
    });
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const file = req.file;

    if (file) {
      req.body.avatar = await File.uploadSingle({ filePath: file.path });
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    console.log(user);

    sendToken(user, 200, res, "successfully updated!");
  } catch (err) {
    return res.status(400).json({
      message: "Please try again later",
      success: false,
    });
  }
};

exports.sendCode = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    await user.getResetPasswordCode();
    await user.save();
    await user.sendResetPasswordCode();

    return res.json({
      message: "Code sent to your email",
      success: true,
    });
  } catch (err) {
    return res.status(400).json({
      message: "Please try again later",
      success: false,
    });
  }
};

exports.verifyCode = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    const status = await user.verifyCode(req.body.code);

    if (status === "expired") {
      return res.status(400).json({
        message: "code expired",
        success: true,
      });
    }

    if (status === "wrong") {
      return res.status(400).json({
        message: "code does not matched",
        success: true,
      });
    }

    return res.json({
      message: "You can now change your password",
      success: true,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: "Please try again later",
      success: false,
    });
  }
};

exports.listAll = async (req, res, next) => {
  try {
    console.log("Asdsad");

    const users = await User.find({});

    return res.json({
      message: "All users",
      success: true,
      users: users,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: "Please try again later",
      success: false,
    });
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    console.log(req.params.id);

    await User.findByIdAndDelete(req.params.id);

    return res.json({
      message: "User Deleted",
      success: true,
    });
  } catch (err) {
    return res.status(400).json({
      message: "Please try again later",
      success: false,
    });
  }
};

exports.updateRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    user.role = req.body.role;

    user.save();

    return res.json({
      message: "User Deleted",
      success: true,
      user: user,
    });
  } catch (err) {
    return res.status(400).json({
      message: "Please try again later",
      success: false,
    });
  }
};

exports.softDeleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: "User soft-deleted successfully",
      user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to soft delete user" });
  }
};

exports.restoreUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: false,
        deletedAt: null,
        isApproved: false, 
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ success: true, message: "User restored successfully", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to restore user" });
  }
};

exports.getDeletedUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: true });

    res.json({ success: true, users });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch deleted users" });
  }
};

exports.getActiveUsers = async (req, res) => {
  try {
    const activeUsers = await User.find({ isActive: true }).select(
      "username email"
    );
    res.status(200).json({ success: true, users: activeUsers });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch active users." });
  }
};

exports.getNumberOfUsers = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    return res.json({
      success: true,
      count: userCount,
    });
  } catch (err) {
    return res.status(400).json({
      message: "Please try again later",
      success: false,
    });
  }
};

exports.approveUser = async (req, res) => {
  try {
    const { isApproved } = req.body;
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: `User ${isApproved ? "approved" : "declined"} successfully.`,
    });
  } catch (error) {
    console.error("Approve user error:", error);
    res.status(500).json({ message: "Failed to update user status." });
  }
};
