import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import PasswordReset from '@/models/PasswordReset';
import { validateOTPFormat, verifyOTP, isOTPExpired, OTP_CONFIG } from '@/lib/otp';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, newPassword } = await request.json();

    // Validate input
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    if (!validateOTPFormat(otp)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid 6-digit OTP' },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the most recent unused OTP for this email
    const passwordReset = await PasswordReset.findOne({
      email: email.toLowerCase(),
      isUsed: false,
    }).sort({ createdAt: -1 });

    if (!passwordReset) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (isOTPExpired(passwordReset.expiresAt)) {
      await PasswordReset.findByIdAndUpdate(passwordReset._id, { isUsed: true });
      return NextResponse.json(
        { success: false, message: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check maximum attempts
    if (passwordReset.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
      await PasswordReset.findByIdAndUpdate(passwordReset._id, { isUsed: true });
      return NextResponse.json(
        { success: false, message: 'Maximum attempts exceeded. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Verify OTP
    const isValidOTP = verifyOTP(otp, passwordReset.otp);
    
    if (!isValidOTP) {
      // Increment attempts
      await PasswordReset.findByIdAndUpdate(passwordReset._id, {
        $inc: { attempts: 1 }
      });

      const remainingAttempts = OTP_CONFIG.MAX_ATTEMPTS - (passwordReset.attempts + 1);
      
      if (remainingAttempts <= 0) {
        await PasswordReset.findByIdAndUpdate(passwordReset._id, { isUsed: true });
        return NextResponse.json(
          { success: false, message: 'Maximum attempts exceeded. Please request a new OTP.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, message: `Invalid OTP. ${remainingAttempts} attempts remaining.` },
        { status: 400 }
      );
    }

    // Find user and update password
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password (works for both manual signup and Google OAuth users)
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      updatedAt: new Date(),
    });

    // Mark OTP as used
    await PasswordReset.findByIdAndUpdate(passwordReset._id, {
      isUsed: true,
      updatedAt: new Date(),
    });

    // Clean up old OTP records for this email
    await PasswordReset.deleteMany({
      email: email.toLowerCase(),
      isUsed: true,
      createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Older than 24 hours
    });

    // Determine message based on whether user had a password before
    const message = user.password 
      ? 'Password has been reset successfully' 
      : 'Password has been set successfully. You can now sign in with email and password.';

    return NextResponse.json(
      { success: true, message },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
} 