import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
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
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build query
    let query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    // Sort options
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [products, totalProducts] = await Promise.all([
      Product.find(query)
        .populate('category', 'name')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        pages: totalPages,
        total: totalProducts,
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
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

    const productData = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'description', 'price', 'category', 'sizes', 'colors', 'images'];
    for (const field of requiredFields) {
      if (!productData[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Verify category exists
    const category = await Category.findById(productData.category);
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Invalid category' },
        { status: 400 }
      );
    }

    const product = await Product.create(productData);
    await product.populate('category', 'name');

    return NextResponse.json(
      { success: true, data: product },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating product:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { action, productIds } = await request.json();

    if (!action || !productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data' },
        { status: 400 }
      );
    }

    let updateData: any = {};
    let successMessage = '';

    switch (action) {
      case 'setFeatured':
        updateData = { isFeatured: true };
        successMessage = 'Products added to trending successfully';
        break;
      case 'removeFeatured':
        updateData = { isFeatured: false };
        successMessage = 'Products removed from trending successfully';
        break;
      case 'activate':
        updateData = { isActive: true };
        successMessage = 'Products activated successfully';
        break;
      case 'deactivate':
        updateData = { isActive: false };
        successMessage = 'Products deactivated successfully';
        break;
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      updateData
    );

    return NextResponse.json({
      success: true,
      message: successMessage,
      data: { 
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount 
      }
    });

  } catch (error) {
    console.error('Error updating products:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 