import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { authOptions } from '@/lib/auth';

const SSLCOMMERZ_API_URL = 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { orderId } = await request.json();

    const order = await Order.findOne({ 
      _id: orderId, 
      user: session.user.id 
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // SSLCommerz payment data
    const paymentData = {
      store_id: process.env.SSLCOMMERZ_STORE_ID,
      store_passwd: process.env.SSLCOMMERZ_STORE_PASSWD,
      total_amount: order.totalPrice,
      currency: 'BDT',
      tran_id: `${order._id}_${Date.now()}`,
      success_url: `${process.env.NEXTAUTH_URL}/api/payments/success`,
      fail_url: `${process.env.NEXTAUTH_URL}/api/payments/fail`,
      cancel_url: `${process.env.NEXTAUTH_URL}/api/payments/cancel`,
      ipn_url: `${process.env.NEXTAUTH_URL}/api/payments/ipn`,
      shipping_method: 'Courier',
      product_name: `Order ${order._id}`,
      product_category: 'Clothing',
      product_profile: 'general',
      cus_name: session.user.name,
      cus_email: session.user.email,
      cus_add1: order.shippingAddress.address,
      cus_city: order.shippingAddress.city || 'Dhaka',
      cus_state: order.shippingAddress.state || 'Dhaka',
      cus_postcode: order.shippingAddress.postalCode || '1000',
      cus_country: 'Bangladesh',
      cus_phone: order.shippingAddress.phone,
      cus_fax: order.shippingAddress.phone,
      ship_name: order.user.name,
      ship_add1: order.shippingAddress.address,
      ship_city: order.shippingAddress.city || 'Dhaka',
      ship_state: order.shippingAddress.state || 'Dhaka',
      ship_postcode: order.shippingAddress.postalCode || '1000',
      ship_country: 'Bangladesh',
      value_a: order._id, // Store order ID for reference
      value_b: session.user.id, // Store user ID for reference
    };

    // Create form data for SSLCommerz
    const formData = new FormData();
    Object.entries(paymentData).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    const response = await fetch(SSLCOMMERZ_API_URL, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.status === 'SUCCESS') {
      // Update order with transaction ID
      await Order.findByIdAndUpdate(order._id, {
        transactionId: paymentData.tran_id,
        paymentStatus: 'pending'
      });

      return NextResponse.json({
        success: true,
        data: {
          redirectUrl: result.redirectGatewayURL,
          transactionId: paymentData.tran_id
        }
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.failedreason || 'Payment initialization failed' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tranId = searchParams.get('tran_id');
    const status = searchParams.get('status');

    if (!tranId) {
      return NextResponse.json(
        { success: false, message: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findOne({ transactionId: tranId });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order status based on payment status
    let updateData: any = {};
    
    if (status === 'VALID') {
      updateData = {
        paymentStatus: 'paid',
        isPaid: true,
        paidAt: new Date(),
        orderStatus: 'processing'
      };
    } else if (status === 'FAILED') {
      updateData = {
        paymentStatus: 'failed',
        orderStatus: 'cancelled'
      };
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      updateData,
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedOrder
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 