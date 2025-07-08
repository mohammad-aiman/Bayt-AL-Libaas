import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const review = await Review.findById(params.id);
    
    if (!review) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }

    const productId = review.product;

    // Delete the review
    await Review.findByIdAndDelete(params.id);

    // Update product ratings after deletion
    const remainingReviews = await Review.find({ product: productId });
    const totalReviews = remainingReviews.length;
    const avgRating = totalReviews > 0 
      ? remainingReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    await Product.findByIdAndUpdate(productId, {
      numReviews: totalReviews,
      rating: avgRating
    });

    return NextResponse.json(
      { success: true, message: 'Review deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 