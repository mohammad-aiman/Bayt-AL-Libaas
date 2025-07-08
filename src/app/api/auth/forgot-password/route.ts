import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import PasswordReset from '@/models/PasswordReset';
import { sendEmail, generatePasswordResetOTPEmail } from '@/lib/email';
import { generateOTP, hashOTP, generateExpiryTime, OTP_CONFIG } from '@/lib/otp';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { success: true, message: 'If this email exists, you will receive a password reset code' },
        { status: 200 }
      );
    }

    // Rate limiting: Check recent requests
    const recentRequests = await PasswordReset.find({
      email: email.toLowerCase(),
      createdAt: { $gte: new Date(Date.now() - OTP_CONFIG.RATE_LIMIT_WINDOW) }
    });

    if (recentRequests.length >= OTP_CONFIG.MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please wait before requesting another code.' },
        { status: 429 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);

    // Save OTP to database
    await PasswordReset.create({
      email: email.toLowerCase(),
      otp: hashedOTP,
      expiresAt: generateExpiryTime(),
      isUsed: false,
      attempts: 0,
    });

    // Send email
    try {
      await sendEmail({
        to: email,
        subject: 'Password Reset OTP - Bayt Al Libaas',
        html: generatePasswordResetOTPEmail(otp, user.name),
      });

      return NextResponse.json(
        { success: true, message: 'Password reset code sent to your email' },
        { status: 200 }
      );
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return NextResponse.json(
        { success: false, message: 'Failed to send email. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
} 