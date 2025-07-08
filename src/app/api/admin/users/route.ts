import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
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
    const role = searchParams.get('role') || '';
    const provider = searchParams.get('provider') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build query
    let query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (provider) {
      query.provider = provider;
    }

    // Sort options
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select('-password') // Exclude password field
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        pages: totalPages,
        total: totalUsers,
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
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

    const { userIds, action, ...updateData } = await request.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User IDs are required' },
        { status: 400 }
      );
    }

    let updateQuery: any = {};

    // Handle different bulk actions
    switch (action) {
      case 'promote':
        updateQuery = { role: 'admin' };
        break;
      case 'demote':
        updateQuery = { role: 'user' };
        break;
      case 'activate':
        updateQuery = { isActive: true };
        break;
      case 'deactivate':
        updateQuery = { isActive: false };
        break;
      case 'update':
        updateQuery = updateData;
        break;
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }

    // Prevent admin from demoting themselves
    if (action === 'demote' && userIds.includes(session.user.id)) {
      return NextResponse.json(
        { success: false, message: 'You cannot change your own role' },
        { status: 400 }
      );
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      updateQuery
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} users updated successfully`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error updating users:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 