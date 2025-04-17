import { createClient } from "redis";

const redisClient = createClient({
  username: 'default',
  password: 'xuKioNwrUdru33Cc5epMSCBsOrgMaxEO',
  socket: {
      host: 'redis-19723.c251.east-us-mz.azure.redns.redis-cloud.com',
      port: 19723
  }
});

redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

(async () => {
  await redisClient.connect();
  await redisClient.set('foo', 'bar');
  const result = await redisClient.get('foo');
  console.log(result)
  console.log("Connected to Redis");
})();

export default redisClient;
