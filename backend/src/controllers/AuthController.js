// AuthController.js
// -----------------------------------------------------------------------------
// Purpose:
//   Handle the three things a "logged-in user" feature needs:
//     1. Login    (email + password)  → returns a JWT and the user object
//     2. Register (open in this capstone demo)
//     3. Me       (who am I?)         → returns the currently-logged-in user
//
// How a noob should read this file:
//   - Each function below is one Express route handler.
//   - A "handler" is just a function that receives the HTTP request
//     (the variable `req`) and produces the HTTP response (the variable `res`).
//   - We use zod to check the incoming data. If the data is bad, zod throws
//     and our central error handler turns it into a 400 response.
// -----------------------------------------------------------------------------

import { z } from 'zod';
import User from '../models/UserModel.js';
import { AppError } from '../utils/Errors.js';
import { sign } from '../utils/Jwt.js';
import { logEvent } from '../utils/Audit.js';
import { ensureDB } from '../config/Database.js';

// LoginSchema: shape we expect for the login request body.
//   - email: must look like an email
//   - password: must be at least 6 characters long
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// RegisterSchema: shape we expect for the register request body.
//   - role: must be one of the five valid roles in our clinic
export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['admin', 'doctor', 'receptionist', 'lab', 'patient']),
});

// -----------------------------------------------------------------------------
// login(req, res)
//   Step 1: read the body and validate it with LoginSchema.
//   Step 2: look up the user by email.
//   Step 3: if user is missing or inactive, fail with "Invalid credentials".
//   Step 4: check the password using bcrypt.
//   Step 5: build a JWT, write an audit log, send back { token, user }.
// -----------------------------------------------------------------------------
export async function login(req, res) {
  // Fail fast with 503 if the DB isn't reachable, instead of buffering the
  // query for 10s and then throwing a MongooseError.
  ensureDB();

  // Step 1: parse + validate the body. zod will throw a ZodError on bad input.
  const parsed = LoginSchema.parse(req.body);
  const email = parsed.email;
  const password = parsed.password;

  // Step 2: look up the user by email.
  const user = await User.findOne({ email: email });

  // Step 3: same error message for "no such user" and "wrong password"
  //         so attackers can't tell which one failed.
  if (!user) {
    throw new AppError(401, 'Invalid credentials');
  }
  if (user.isActive === false) {
    throw new AppError(401, 'Invalid credentials');
  }

  // Step 4: check the password (bcrypt hash compare).
  const passwordOk = await user.checkPassword(password, user.passwordHash);
  if (!passwordOk) {
    throw new AppError(401, 'Invalid credentials');
  }

  // Step 5: build the JWT and respond.
  const token = sign({ sub: user._id.toString(), role: user.role });
  await logEvent({ req: req, user: user, action: 'auth.login' });
  res.json({ token: token, user: user.toSafeJSON() });
}

// -----------------------------------------------------------------------------
// register(req, res)
//   Creates a brand new user account.
//   (In production this should be admin-only; open here for the capstone demo.)
// -----------------------------------------------------------------------------
export async function register(req, res) {
  // Same DB guard as login.
  ensureDB();

  // Step 1: parse + validate.
  const data = RegisterSchema.parse(req.body);

  // Step 2: check the email isn't already in use.
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new AppError(409, 'Email already in use');
  }

  // Step 3: hash the password and create the user document.
  const passwordHash = await User.hashPassword(data.password);
  const newUser = await User.create({
    email: data.email,
    passwordHash: passwordHash,
    name: data.name,
    role: data.role,
  });

  // Step 4: sign a token so the user is immediately "logged in".
  const token = sign({ sub: newUser._id.toString(), role: newUser.role });

  // Step 5: audit log and respond.
  await logEvent({ req: req, user: newUser, action: 'auth.register' });
  res.status(201).json({ token: token, user: newUser.toSafeJSON() });
}

// -----------------------------------------------------------------------------
// me(req, res)
//   Returns the currently logged-in user.
//   `req.user` was filled in by AuthMiddleware when the JWT was verified.
// -----------------------------------------------------------------------------
export async function me(req, res) {
  const userId = req.user._id;
  const currentUser = await User.findById(userId).lean();

  // .lean() returns a plain JS object (faster) but we still need to strip the hash.
  if (currentUser) {
    delete currentUser.passwordHash;
  }
  res.json({ user: currentUser });
}
