let user = require("../model/userModel");

const LogoutRout = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true, // true in production (HTTPS)
      sameSite: "None", // if frontend & backend on different domain
    });
    res.json({ message: "Logout successful", status: 200, success: true, error: false });
  } catch (e) {
    res.json({
      message: "Something went wrong",
      status: 500,
      data: e,
      success: false,
      error: true,
    });
  }
};

module.exports = { LogoutRout };
