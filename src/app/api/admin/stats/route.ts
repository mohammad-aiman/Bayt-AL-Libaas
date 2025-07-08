import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

interface OrderItem {
  status: string;
  name: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    let startDate: Date;
    const endDate = new Date();

    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const [
      totalOrders,
      totalProducts,
      totalUsers,
      recentOrders,
      lowStockProducts,
      topSellingProducts,
      pendingOrders
    ] = await Promise.all([
      // Total orders in period
      Order.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      }),
      
      // Total products
      Product.countDocuments({ isActive: true }),
      
      // Total users
      User.countDocuments({ role: 'user' }),
      
      // Recent orders
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      
      // Low stock products
      Product.find({ stock: { $lt: 10 }, isActive: true })
        .select('name stock images')
        .limit(5)
        .lean(),
      
      // Top selling products
      Product.find({ isActive: true })
        .sort({ sold: -1 })
        .limit(5)
        .select('name sold images price')
        .lean(),

      // Pending orders count - match the logic from orders list
      Order.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
        isConfirmed: false,
        isCancelled: false
      }).then(count => {
        console.log('Debug - Pending orders count:', count);
        return count;
      })
    ]);

    const stats = {
      totalOrders,
      totalProducts,
      totalUsers,
      recentOrders,
      lowStockProducts,
      topSellingProducts,
      pendingOrders
    };

    console.log('Debug - Final stats:', {
      totalOrders: stats.totalOrders,
      pendingOrders: stats.pendingOrders,
      period: period
    });

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 