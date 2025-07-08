import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { authOptions } from '@/lib/auth';

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Get featured products with analytics
    const [featuredProducts, totalFeatured, featuredStats] = await Promise.all([
      Product.find({ isFeatured: true })
        .populate('category', 'name')
        .sort({ sold: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      
      Product.countDocuments({ isFeatured: true }),
      
      Product.aggregate([
        { $match: { isFeatured: true } },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$sold' },
            averageRating: { $avg: '$rating' },
            totalStock: { $sum: '$stock' },
            totalProducts: { $sum: 1 }
          }
        }
      ])
    ]);

    const stats = featuredStats[0] || {
      totalSales: 0,
      averageRating: 0,
      totalStock: 0,
      totalProducts: 0
    };

    return NextResponse.json({
      success: true,
      data: {
        products: featuredProducts,
        stats,
        pagination: {
          page,
          pages: Math.ceil(totalFeatured / limit),
          total: totalFeatured,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Error fetching trending products:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { action, productIds, priority } = await request.json();

    if (!action || !productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'reorder':
        // Handle reordering of featured products
        // This could be implemented with a priority field if needed
        for (let i = 0; i < productIds.length; i++) {
          await Product.findByIdAndUpdate(productIds[i], {
            featuredPriority: i + 1
          });
        }
        break;
        
      case 'addMultiple':
        await Product.updateMany(
          { _id: { $in: productIds } },
          { isFeatured: true }
        );
        break;
        
      case 'removeMultiple':
        await Product.updateMany(
          { _id: { $in: productIds } },
          { isFeatured: false }
        );
        break;
        
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: 'Trending products updated successfully'
    });

  } catch (error) {
    console.error('Error updating trending products:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 