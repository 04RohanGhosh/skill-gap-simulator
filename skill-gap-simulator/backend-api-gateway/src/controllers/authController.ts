import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/generateToken';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.is_admin,
        token: generateToken(user.id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  }
);

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.is_admin,
        token: generateToken(user.id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  }
);

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ message: 'Logged out successfully' });
  }
);

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.is_admin,
        avatar_url: user.avatar_url,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  }
);

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user._id);

    if (user) {
      const updatedUser = await User.findByIdAndUpdate(
        user.id,
        {
          name: req.body.name || user.name,
          email: req.body.email || user.email,
          avatar_url: req.body.avatar_url || user.avatar_url,
        },
        { new: true }
      );

      res.json({
        _id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.is_admin,
        avatar_url: updatedUser.avatar_url,
        token: generateToken(updatedUser.id),
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  }
);