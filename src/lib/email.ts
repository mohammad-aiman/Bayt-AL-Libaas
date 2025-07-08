import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailData) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Bayt Al Libaas <onboarding@resend.dev>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Email sending error:', error);
      throw error;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Email sent successfully:', data);
    }
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export function generateOrderConfirmationEmail(order: any) {
  const { orderItems, totalPrice, shippingAddress, _id } = order;
  
  const itemsHtml = orderItems.map((item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover;">
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong><br>
        Size: ${item.size} | Color: ${item.color}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ৳${item.price}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - Bayt Al Libaas</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .total { font-size: 18px; font-weight: bold; color: #4f46e5; }
        .footer { text-align: center; margin-top: 30px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
          <p>Thank you for your order!</p>
        </div>
        
        <div class="content">
          <h2>Order #${_id}</h2>
          <p>Your order has been received and is being processed.</p>
          
          <div class="order-details">
            <h3>Order Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Details</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div style="margin-top: 20px; text-align: right;">
              <p class="total">Total: ৳${totalPrice}</p>
            </div>
          </div>
          
          <div class="order-details">
            <h3>📦 Shipping Address:</h3>
            <p style="margin: 5px 0;">
              ${shippingAddress.address}<br>
              ${shippingAddress.city || ''} ${shippingAddress.postalCode || ''}<br>
              ${shippingAddress.state || 'Bangladesh'}<br>
              📞 ${shippingAddress.phone}
            </p>
          </div>
          
          <div class="order-details">
            <h3>What's Next?</h3>
            <p>
              • We'll process your order within 1-2 business days<br>
              • You'll receive a shipping confirmation email once your order is dispatched<br>
              • Track your order in your account dashboard
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Bayt Al Libaas!</p>
          <p>If you have any questions, please contact us at support@baytallibaas.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateOrderStatusEmail(order: any, status: string) {
  const statusMessages = {
    processing: 'Your order is being processed',
    shipped: 'Your order has been shipped',
    delivered: 'Your order has been delivered',
    cancelled: 'Your order has been cancelled'
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Update - Bayt Al Libaas</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .status-badge { 
          display: inline-block; 
          padding: 8px 16px; 
          background: #10b981; 
          color: white; 
          border-radius: 20px; 
          font-weight: bold;
        }
        .footer { text-align: center; margin-top: 30px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Update</h1>
        </div>
        
        <div class="content">
          <h2>Order #${order._id}</h2>
          <p>Status: <span class="status-badge">${status.toUpperCase()}</span></p>
          <p>${statusMessages[status as keyof typeof statusMessages]}</p>
          
          <div style="margin-top: 30px;">
            <a href="${process.env.NEXTAUTH_URL}/orders/${order._id}" 
               style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Order Details
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Bayt Al Libaas!</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateWelcomeEmail(userName: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Bayt Al Libaas</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .cta-button { 
          background: #4f46e5; 
          color: white; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 6px; 
          display: inline-block; 
          margin: 20px 0;
        }
        .footer { text-align: center; margin-top: 30px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Bayt Al Libaas!</h1>
        </div>
        
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>Thank you for joining Bayt Al Libaas, your premier destination for women's fashion in Bangladesh.</p>
          
          <p>We're excited to have you as part of our community. Here's what you can expect:</p>
          
          <ul>
            <li>✨ Latest trends in women's fashion</li>
            <li>🛍️ Exclusive deals and discounts</li>
            <li>📦 Fast and reliable delivery</li>
            <li>💝 Personalized shopping experience</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/shop" class="cta-button">
              Start Shopping
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>Happy Shopping!</p>
          <p>The Bayt Al Libaas Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
} 

export function generatePasswordResetOTPEmail(otp: string, userName: string = 'User') {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset OTP - Bayt Al Libaas</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .otp-box { 
          background: white; 
          border: 2px solid #4f46e5; 
          border-radius: 8px; 
          padding: 20px; 
          margin: 20px 0; 
          text-align: center; 
        }
        .otp-code { 
          font-size: 32px; 
          font-weight: bold; 
          color: #4f46e5; 
          letter-spacing: 5px; 
          margin: 10px 0; 
        }
        .warning { 
          background: #fef3c7; 
          border: 1px solid #f59e0b; 
          border-radius: 6px; 
          padding: 15px; 
          margin: 20px 0; 
        }
        .footer { text-align: center; margin-top: 30px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>We received a request to reset/set your password for your Bayt Al Libaas account.</p>
          
          <div class="otp-box">
            <h3>Your OTP Code:</h3>
            <div class="otp-code">${otp}</div>
            <p style="margin: 0; color: #666; font-size: 14px;">This code will expire in 10 minutes</p>
          </div>
          
          <div class="warning">
            <h4 style="margin-top: 0;">🔐 Security Notice:</h4>
            <ul style="margin: 0; padding-left: 20px;">
              <li>This OTP is valid for only 10 minutes</li>
              <li>Never share this code with anyone</li>
              <li>If you didn't request this, please ignore this email</li>
              <li>Your account remains secure</li>
            </ul>
          </div>
          
          <p><strong>How to use this OTP:</strong></p>
          <ol>
            <li>Go back to the password reset page</li>
            <li>Enter this 6-digit code</li>
            <li>Create your new password</li>
            <li>Sign in with your new credentials</li>
          </ol>
        </div>
        
        <div class="footer">
          <p>If you didn't request a password reset, please contact us immediately.</p>
          <p>The Bayt Al Libaas Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
} 