import { sendEmail, generateWelcomeEmail, generateOrderConfirmationEmail } from '../src/lib/email';

async function testEmailService() {
  console.log('Testing email service...');

  try {
    // Test welcome email
    const welcomeHtml = generateWelcomeEmail('Test User');
    await sendEmail({
      to: 'test@example.com',
      subject: 'Welcome to Bayt Al Libaas - Test',
      html: welcomeHtml
    });
    console.log('✅ Welcome email sent successfully');

    // Test order confirmation email
    const sampleOrder = {
      _id: '507f1f77bcf86cd799439011',
      orderItems: [
        {
          name: 'Elegant Dress',
          image: 'https://example.com/dress.jpg',
          size: 'M',
          color: 'Black',
          quantity: 1,
          price: 1500
        }
      ],
      totalPrice: 1560,
      shippingAddress: {
        address: '123 Main Street',
        city: 'Dhaka',
        postalCode: '1000',
        state: 'Dhaka',
        phone: '+880123456789'
      }
    };

    const orderHtml = generateOrderConfirmationEmail(sampleOrder);
    await sendEmail({
      to: 'test@example.com',
      subject: 'Order Confirmation - Test',
      html: orderHtml
    });
    console.log('✅ Order confirmation email sent successfully');

    console.log('🎉 All email tests passed!');
    
  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
}

testEmailService(); 