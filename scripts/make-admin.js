const { MongoClient } = require('mongodb');

async function makeAdmin() {
  const uri = process.env.MONGODB_URI || "mongodb+srv://aimanbinakram:meow123@cluster0.lb1hipx.mongodb.net/baytallibaas?retryWrites=true&w=majority&appName=Cluster0";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('baytallibaas');
    
    const result = await db.collection('users').updateOne(
      { email: 'admin@baytallibaas.com' },
      { $set: { role: 'admin' } }
    );

    if (result.matchedCount === 0) {
      console.log('User not found. Please create the user first through the signup page.');
    } else {
      console.log('Successfully updated user to admin role!');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

makeAdmin(); 