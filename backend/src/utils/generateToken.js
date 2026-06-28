const jwt = require("jsonwebtoken");

// Both userId and role are embedded in the token so socket.js can
// derive the user's role at handshake time without an extra DB query.
const generateToken = (userId, role) => {
  return jwt.sign(
    {
      userId,
      role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

module.exports = generateToken;