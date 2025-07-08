import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

interface OrderItem {
  _id: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  confirmedAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
}

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const order = await Order.findById(params.id)
      .populate('user', 'name email phone')
      .lean();

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const updateData = await request.json();

    // Handle individual item updates
    if (updateData.itemUpdates) {
      console.log('Received itemUpdates:', updateData.itemUpdates);
      
      let finalOrder = null;
      
      for (const update of updateData.itemUpdates) {
        try {
          console.log('Processing update for item:', update.itemId);
          
          // Validate the itemId is a valid ObjectId
          if (!mongoose.Types.ObjectId.isValid(update.itemId)) {
            return NextResponse.json(
              { success: false, message: 'Invalid item ID format' },
              { status: 400 }
            );
          }

          // First, verify the order and item exist
          const existingOrder = await Order.findOne({
            _id: params.id,
            'orderItems._id': new mongoose.Types.ObjectId(update.itemId)
          });

          if (!existingOrder) {
            return NextResponse.json(
              { success: false, message: 'Order or item not found' },
              { status: 404 }
            );
          }

          // Update the item status
          const order = await Order.findOneAndUpdate(
            { 
              _id: params.id,
              'orderItems._id': new mongoose.Types.ObjectId(update.itemId)
            },
            {
              $set: {
                'orderItems.$.status': update.status,
                'orderItems.$.confirmedAt': update.status === 'confirmed' ? new Date() : null,
                'orderItems.$.cancelledAt': update.status === 'cancelled' ? new Date() : null
              }
            },
            { new: true }
          );

          if (!order) {
            throw new Error('Failed to update order item');
          }

          console.log('Updated order items:', order.orderItems);

          // Update order status based on item statuses
          const allItems = order.orderItems;
          const confirmedItems = allItems.filter((item: any) => item.status === 'confirmed');
          const cancelledItems = allItems.filter((item: any) => item.status === 'cancelled');
          const pendingItems = allItems.filter((item: any) => item.status === 'pending');

          // Calculate the updates for order status
          const orderUpdates: any = {};

          // If all items are confirmed
          if (confirmedItems.length === allItems.length) {
            orderUpdates.isConfirmed = true;
            orderUpdates.confirmedAt = new Date();
            orderUpdates.isCancelled = false;
            orderUpdates.cancelledAt = null;
          }
          // If all items are cancelled
          else if (cancelledItems.length === allItems.length) {
            orderUpdates.isCancelled = true;
            orderUpdates.cancelledAt = new Date();
            orderUpdates.isConfirmed = false;
            orderUpdates.confirmedAt = null;
          }
          // If mixed status
          else {
            orderUpdates.isConfirmed = confirmedItems.length > 0;
            orderUpdates.isCancelled = false;
            if (orderUpdates.isConfirmed && !order.confirmedAt) {
              orderUpdates.confirmedAt = new Date();
            }
          }

          // Recalculate prices
          const confirmedAndPendingItems = order.orderItems.filter((item: any) => 
            item.status !== 'cancelled'
          );
          
          const itemsPrice = confirmedAndPendingItems.reduce(
            (total: number, item: any) => total + item.price * item.quantity,
            0
          );
          
          const shippingPrice = itemsPrice > 2000 ? 0 : 60;
          const taxPrice = Math.round(itemsPrice * 0.05);
          const totalPrice = itemsPrice + shippingPrice + taxPrice;

          // Update the order with all changes
          finalOrder = await Order.findOneAndUpdate(
            { _id: params.id },
            {
              $set: {
                ...orderUpdates,
                itemsPrice,
                shippingPrice,
                taxPrice,
                totalPrice
              }
            },
            { new: true }
          ).populate('user', 'name email phone');

          if (!finalOrder) {
            throw new Error('Failed to update order');
          }

        } catch (error) {
          console.error('Error processing item update:', error);
          return NextResponse.json(
            { success: false, message: 'Failed to update item' },
            { status: 500 }
          );
        }
      }

      // Return the final updated order after all items have been processed
      return NextResponse.json({
        success: true,
        data: finalOrder
      });
    }

    // Handle order-level status updates
    const order = await Order.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'name email phone');

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Error updating order:', error);
    
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