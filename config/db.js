const dns = require("dns");
const mongoose = require("mongoose");

// Accept both names: README/.env use MONGO_URI, older code used MONGO_URL.
const getMongoUri = () => process.env.MONGO_URI || process.env.MONGO_URL;

module.exports = async function connectDB() {
  const uri = getMongoUri();
  if (!uri) throw new Error("MONGO_URI is missing in .env");

  // Fixes "querySrv ECONNREFUSED" for mongodb+srv:// links on some Windows networks/ISPs.
  if (process.env.MONGO_DNS_SERVERS) {
    try {
      const servers = process.env.MONGO_DNS_SERVERS.split(",").map((s) => s.trim()).filter(Boolean);
      if (servers.length) dns.setServers(servers);
    } catch (dnsErr) {
      console.warn("DNS server configuration skipped:", dnsErr.message);
    }
  }

  await mongoose.connect(uri);
  console.log("MongoDB connected successfully");
};
