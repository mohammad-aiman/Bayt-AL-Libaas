import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Review from '@/models/Review';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const product = await Product.findOne({ slug: params.slug });
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [reviews, totalReviews] = await Promise.all([
      Review.find({ product: product._id })
        .populate('user', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ product: product._id })
    ]);

    const totalPages = Math.ceil(totalReviews / limit);

    return NextResponse.json({
      success: true,
      data: reviews,
      pagination: {
        page,
        pages: totalPages,
        total: totalReviews,
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const product = await Product.findOne({ slug: params.slug });
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const { rating, comment } = await request.json();

    if (!rating || !comment) {
      return NextResponse.json(
        { success: false, message: 'Rating and comment are required' },
        { status: 400 }
      );
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      user: session.user.id,
      product: product._id
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, message: 'You have already reviewed this product' },
        { status: 400 }
      );
    }

    const review = await Review.create({
      user: session.user.id,
      product: product._id,
      rating,
      comment
    });

    // Update product ratings
    const allReviews = await Review.find({ product: product._id });
    const totalReviews = allReviews.length;
    const avgRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

    await Product.findByIdAndUpdate(product._id, {
      numReviews: totalReviews,
      rating: avgRating
    });

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name')
      .lean();

    return NextResponse.json(
      { success: true, data: populatedReview },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { reviewId, rating, comment } = await request.json();

    await connectDB();
    
    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    // Check if the user is the owner of the review
    if (review.user.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to edit this review" },
        { status: 403 }
      );
    }

    // Update the review
    review.rating = rating;
    review.comment = comment;
    await review.save();

    return NextResponse.json({ message: "Review updated successfully" });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
} 