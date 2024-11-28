"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const Engine_1 = require("./businessLogic/Engine");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const engine = new Engine_1.Engine();
        console.log("HI");
        try {
            // const redisClient = createClient();
            const redisClient = (0, redis_1.createClient)({
                legacyMode: true,
                url: "redis://127.0.0.1:6379",
                pingInterval: 1000,
            });
            redisClient.connect();
            while (true) {
                const res = yield redisClient.rPop("messages");
                if (!res) {
                    console.log("No data came from redis");
                    continue;
                }
                else {
                    engine.process(JSON.parse(res));
                }
            }
        }
        catch (e) {
            console.log("Error");
            console.log(e);
        }
    });
}
main();
