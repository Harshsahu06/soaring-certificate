import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

// Helper to resolve SRV records via public DNS resolvers if local ISP DNS blocks querySrv
async function resolveSrvUriIfNeeded(uri) {
  if (!uri || !uri.startsWith('mongodb+srv://')) return uri;

  try {
    const match = uri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?]+)(\/.*)?$/);
    if (!match) return uri;

    const [, user, pass, host, rest = '/'] = match;
    const srvHostname = `_mongodb._tcp.${host}`;

    const resolver = new dns.Resolver();
    resolver.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

    const srvRecords = await new Promise((resolve, reject) => {
      resolver.resolveSrv(srvHostname, (err, addresses) => {
        if (err) reject(err);
        else resolve(addresses);
      });
    });

    if (srvRecords && srvRecords.length > 0) {
      const shardHosts = srvRecords.map((r) => `${r.name}:${r.port}`).join(',');
      const sep = rest.includes('?') ? '&' : '?';
      return `mongodb://${user}:${pass}@${shardHosts}${rest}${sep}ssl=true&authSource=admin`;
    }
  } catch (err) {
    console.warn('Custom SRV DNS resolution notice:', err.message);
  }

  return uri;
}

export async function connectDB() {
  if (!MONGODB_URI) {
    console.log('ℹ️ Running in Local Mode: No MONGODB_URI found in .env');
    return false;
  }

  try {
    // 1. Try standard connection
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`✅ MongoDB Atlas Connected Successfully: DB [${conn.connection.name}]`);
    return true;
  } catch (firstErr) {
    // 2. If SRV DNS failed on Windows, try with resolved shard seedlist
    if (firstErr.message?.includes('querySrv') || firstErr.message?.includes('ECONNREFUSED')) {
      try {
        console.log('🔄 Resolving SRV DNS via Google/Cloudflare Public DNS...');
        const resolvedUri = await resolveSrvUriIfNeeded(MONGODB_URI);
        const conn = await mongoose.connect(resolvedUri, {
          serverSelectionTimeoutMS: 5000,
        });
        console.log(`✅ MongoDB Atlas Connected Successfully (via Public DNS SRV): DB [${conn.connection.name}]`);
        return true;
      } catch (secondErr) {
        if (secondErr.message?.includes('bad auth') || secondErr.message?.includes('authentication failed')) {
          console.error('❌ MongoDB Atlas Error: Authentication Failed! Check username/password in .env');
        } else {
          console.error('❌ MongoDB Atlas Connection Error:', secondErr.message);
        }
        return false;
      }
    }

    if (firstErr.message?.includes('bad auth') || firstErr.message?.includes('authentication failed')) {
      console.error('❌ MongoDB Atlas Error: Authentication Failed! Check username/password in .env');
    } else {
      console.error('ℹ️ Running in Local Mode (MongoDB Atlas Notice: ' + firstErr.message + ')');
    }
    return false;
  }
}
