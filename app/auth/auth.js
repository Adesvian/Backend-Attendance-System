const prisma = require("./prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const CryptoJs = require("crypto-js");

const encrypt = (key, data) => {
  return CryptoJs.AES.encrypt(data, key).toString();
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Username or password is incorrect" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Username or password is incorrect" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        // set expiration time 30 seconds
        expiresIn: "12h",
      }
    );

    // Encrypt the token before setting it in the cookie
    const encryptedToken = encrypt(process.env.JWT_SECRET, token);

    res.cookie("_USER_AUTH_RAMADHAN", encryptedToken, {
      secure: true,
      httpOnly: true, // Ensure the cookie is only accessible via HTTP(S), not JavaScript
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      token,
      id: user.id,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong with server" });
  }
};

exports.getCookies = (req, res) => {
  res.json(req.cookies);
};

exports.logout = async (req, res) => {
  const cookies = req.cookies._USER_AUTH_RAMADHAN;
  if (!cookies) return res.sendStatus(204);
  res.clearCookie("_USER_AUTH_RAMADHAN");
  res.status(200).json({ message: "Logout success" });
};

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token);
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
    if (err) return res.sendStatus(403);
    req.user = decode;
    next();
  });
};
