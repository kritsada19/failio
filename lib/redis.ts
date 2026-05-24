import Redis from "ioredis"

// สร้าง redis client
export const redis = new Redis({
    host: "localhost",
    port: 6379,

    // ถ้ามี password
    // password: "1234",

    // ถ้าใช้ redis cloud
    // username: "default",

    maxRetriesPerRequest: null,

})