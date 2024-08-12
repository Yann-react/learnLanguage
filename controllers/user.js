const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} = require("../config/firebase");
const auth = getAuth();

const registerUser = async (req, res) => {
  const { email, password, fullName } = req.body;
  if (!email || !password || !fullName) {
    return res.status(422).json({
      email: "Email is required",
      password: "Password is required",
      fullName: "Full name is required",
    });
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;
    console.log(firebaseUser.uid);

    const newUser = await prisma.user.create({
      data: {
        auth_id: firebaseUser.uid,
        fullName: fullName,
        email: email,
        password: password,
      },
    });

    res.status(201).json({
      message: "User created successfully!",
      user: newUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message || "An error occurred while registering user",
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({
      email: "Email is required",
      password: "Password is required",
    });
  }

  try {
    // Sign in the user with Firebase
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    // Retrieve the user from the database
    const dbUser = await prisma.user.findUnique({
      where: {
        auth_id: firebaseUser.uid,
      },
    });

    if (!dbUser) {
      return res.status(404).json({ error: "User not found in the database" });
    }

    const idToken = userCredential._tokenResponse.idToken;
    res.cookie("access_token", idToken, { httpOnly: true });

    res.status(200).json({
      message: "User logged in successfully",
      user: dbUser,
      token: idToken,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: error.message || "An error occurred while logging in" });
  }
};

const logoutUser = (req, res) => {
  signOut(auth)
    .then(() => {
      res.clearCookie("access_token");
      res.status(200).json({ message: "User logged out successfully" });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    });
};

const resetPassword = (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(422).json({
      email: "Email is required",
    });
  }

  sendPasswordResetEmail(auth, email)
    .then(() => {
      res
        .status(200)
        .json({ message: "Password reset email sent successfully!" });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
};
