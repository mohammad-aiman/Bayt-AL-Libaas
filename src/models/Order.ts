import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Order must belong to a user'],
  },
  orderItems: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Order item must have a product'],
    },
    name: {
      type: String,
      required: [true, 'Order item must have a name'],
    },
    image: {
      type: String,
      required: [true, 'Order item must have an image'],
    },
    price: {
      type: Number,
      required: [true, 'Order item must have a price'],
      min: [0, 'Price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Order item must have a quantity'],
      min: [1, 'Quantity must be at least 1'],
    },
    size: {
      type: String,
      default: 'N/A',
    },
    color: {
      type: String,
      default: 'N/A',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    confirmedAt: Date,
    cancelledAt: Date,
    cancelReason: {
      type: String,
      maxlength: [500, 'Cancel reason cannot be more than 500 characters'],
    },
  }],
  shippingAddress: {
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    city: {
      type: String,
      required: false,
    },
    state: {
      type: String,
      required: false,
    },
    postalCode: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['cod', 'sslcommerz', 'bkash', 'nagad', 'rocket', 'card'],
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String,
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative'],
  },
  shippingPrice: {
    type: Number,
    required: [true, 'Shipping price is required'],
    min: [0, 'Shipping price cannot be negative'],
    default: 0,
  },
  taxPrice: {
    type: Number,
    required: [true, 'Tax price is required'],
    min: [0, 'Tax price cannot be negative'],
    default: 0,
  },
  itemsPrice: {
    type: Number,
    required: [true, 'Items price is required'],
    min: [0, 'Items price cannot be negative'],
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  isDelivered: {
    type: Boolean,
    default: false,
  },
  isShipped: {
    type: Boolean,
    default: false,
  },
  isConfirmed: {
    type: Boolean,
    default: false,
  },
  isCancelled: {
    type: Boolean,
    default: false,
  },
  cancelReason: {
    type: String,
    maxlength: [500, 'Cancel reason cannot be more than 500 characters'],
  },
  paidAt: {
    type: Date,
  },
  deliveredAt: {
    type: Date,
  },
  shippedAt: {
    type: Date,
  },
  confirmedAt: {
    type: Date,
  },
  cancelledAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Add index for better query performance
orderSchema.index({ user: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ isPaid: 1 });
orderSchema.index({ isDelivered: 1 });
orderSchema.index({ isShipped: 1 });
orderSchema.index({ isConfirmed: 1 });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order; 