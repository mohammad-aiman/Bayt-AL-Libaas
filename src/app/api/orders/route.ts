import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { 
  logAuditEvent, 
  sanitizeInput,
  globalRateLimiter
} from '@/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Rate limiting
    const identifier = session.user.id;
    if (globalRateLimiter.isRateLimited(identifier)) {
      return NextResponse.json(
        { success: false, message: 'Rate limit exceeded', code: 'RATE_LIMITED' },
        { status: 429 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const skip = (page - 1) * limit;

    // Sanitize search parameters
    const search = sanitizeInput(searchParams.get('search') || '');
    const status = sanitizeInput(searchParams.get('status') || '');

    let query: any = {};
    
    // Role-based access control
    if (session.user.role !== 'admin') {
      // Regular users can only see their own orders
      query.user = session.user.id;
    } else {
      // Admins can see all orders, but can filter by user if specified
      const userId = searchParams.get('userId');
      if (userId) {
        query.user = userId;
      }
    }

    // Add search filters if provided
    if (search) {
      query.$or = [
        { _id: { $regex: search, $options: 'i' } },
        { 'orderItems.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status) {
      switch (status) {
        case 'pending':
          query.isConfirmed = false;
          query.isCancelled = false;
          break;
        case 'processing':
          query.isConfirmed = true;
          query.isShipped = false;
          query.isCancelled = false;
          break;
        case 'shipped':
          query.isShipped = true;
          query.isDelivered = false;
          query.isCancelled = false;
          break;
        case 'delivered':
          query.isDelivered = true;
          query.isCancelled = false;
          break;
        case 'cancelled':
          query.isCancelled = true;
          break;
      }
    }

    const [orders, totalOrders] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalOrders / limit);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        pages: totalPages,
        total: totalOrders,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Rate limiting for order creation
    const identifier = session.user.id;
    if (globalRateLimiter.isRateLimited(`order_${identifier}`)) {
      return NextResponse.json(
        { success: false, message: 'Too many orders created. Please wait.', code: 'RATE_LIMITED' },
        { status: 429 }
      );
    }

    await connectDB();
    const orderData = sanitizeInput(await request.json());

    // Basic validation
    const requiredFields = ['orderItems', 'shippingAddress', 'paymentMethod'];
    const missingFields = requiredFields.filter(field => !orderData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, message: `Missing required fields: ${missingFields.join(', ')}`, code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Create order logic here (keeping it simple for now)
    // ... (rest of POST logic - shortened for brevity)

    // Validate order items
    if (!Array.isArray(orderData.orderItems) || orderData.orderItems.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Order must contain at least one item', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Validate shipping address
    const { address, phone } = orderData.shippingAddress;
    if (!address || !phone) {
      return NextResponse.json(
        { success: false, message: 'Shipping address and phone are required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Create the order
    const order = new Order({
      user: session.user.id,
      orderItems: orderData.orderItems,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      itemsPrice: orderData.itemsPrice,
      shippingPrice: orderData.shippingPrice,
      taxPrice: orderData.taxPrice,
      totalPrice: orderData.totalPrice,
      isPaid: orderData.paymentMethod === 'cod' ? false : true,
      paidAt: orderData.paymentMethod === 'cod' ? null : new Date(),
      isConfirmed: false,
      isShipped: false,
      isDelivered: false,
      isCancelled: false
    });

    const savedOrder = await order.save();

    // Log the audit event
    await logAuditEvent(
      { id: session.user.id, email: session.user.email },
      'CREATE_ORDER',
      'orders',
      request,
      { resourceId: savedOrder._id, success: true }
    );

    return NextResponse.json(
      { success: true, message: 'Order created successfully', data: savedOrder },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const isAdmin = request.nextUrl.searchParams.get('isAdmin');
    
    if (isAdmin === 'true' && session.user.role === 'admin') {
      // Admin clearing all orders
      await Order.deleteMany({});
      return NextResponse.json({ message: "All order history cleared successfully" });
    } else {
      // User clearing their own orders
      await Order.deleteMany({ user: session.user.id });
      return NextResponse.json({ message: "Your order history cleared successfully" });
    }
  } catch (error) {
    console.error("Error clearing order history:", error);
    return NextResponse.json(
      { error: "Failed to clear order history" },
      { status: 500 }
    );
  }
}