import Redis from 'ioredis';

const redis = new Redis(); // Connects to localhost:6379 by default

export default redis;
