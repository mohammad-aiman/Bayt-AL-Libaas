import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const skip = (page - 1) * limit;

    // Get search parameters
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const userId = searchParams.get('userId') || '';

    let query: any = {};

    // Add user filter if specified
    if (userId) {
      query.user = userId;
    }

    // Add search filters
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
    console.error('Error fetching admin orders:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectDB();

    const { orderIds, action, value } = await request.json();

    // Validate input
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Order IDs are required' },
        { status: 400 }
      );
    }

    // Limit bulk operations to prevent abuse
    if (orderIds.length > 100) {
      return NextResponse.json(
        { success: false, message: 'Cannot update more than 100 orders at once' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { success: false, message: 'Action is required' },
        { status: 400 }
      );
    }

    let updateQuery: any = {};

    // Define allowed actions and their corresponding updates
    switch (action) {
      case 'confirm':
        updateQuery = { isConfirmed: true };
        break;
      case 'ship':
        updateQuery = { isShipped: true, isConfirmed: true };
        break;
      case 'deliver':
        updateQuery = { isDelivered: true, isShipped: true, isConfirmed: true };
        break;
      case 'cancel':
        updateQuery = { isCancelled: true };
        break;
      case 'set_status':
        if (!value) {
          return NextResponse.json(
            { success: false, message: 'Status value is required' },
            { status: 400 }
          );
        }
        // Reset all status flags first
        updateQuery = {
          isConfirmed: false,
          isShipped: false,
          isDelivered: false,
          isCancelled: false
        };
        // Set specific status
        switch (value) {
          case 'pending':
            break; // All flags remain false
          case 'processing':
            updateQuery.isConfirmed = true;
            break;
          case 'shipped':
            updateQuery.isConfirmed = true;
            updateQuery.isShipped = true;
            break;
          case 'delivered':
            updateQuery.isConfirmed = true;
            updateQuery.isShipped = true;
            updateQuery.isDelivered = true;
            break;
          case 'cancelled':
            updateQuery.isCancelled = true;
            break;
          default:
            return NextResponse.json(
              { success: false, message: 'Invalid status value' },
              { status: 400 }
            );
        }
        break;
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }

    // Update orders
    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: updateQuery }
    );

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} orders`,
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      }
    });

  } catch (error) {
    console.error('Error bulk updating orders:', error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 