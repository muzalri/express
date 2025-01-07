const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Mencoba koneksi ke MongoDB...');
    console.log('MONGO_URI:', process.env.MONGO_URI);
    
    const dns = require('dns');
    const os = require('os');
    
    const networkInterfaces = os.networkInterfaces();
    console.log('Network Interfaces:', networkInterfaces);
    
    dns.lookup(os.hostname(), (err, address, family) => {
      console.log('Server IP Address:', address);
      console.log('IP version:', family);
    });
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error koneksi MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
