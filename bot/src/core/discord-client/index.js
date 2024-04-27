"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.discordClient = void 0;
var discord_js_1 = require("discord.js");
var discordClientSingleton = function () {
    return new discord_js_1.Client({ intents: [
            discord_js_1.GatewayIntentBits.Guilds,
            discord_js_1.GatewayIntentBits.GuildMembers,
            discord_js_1.GatewayIntentBits.GuildVoiceStates,
            discord_js_1.GatewayIntentBits.GuildMembers,
            discord_js_1.GatewayIntentBits.GuildPresences,
            discord_js_1.GatewayIntentBits.MessageContent,
        ] });
};
var globalForDiscord = globalThis;
exports.discordClient = (_a = globalForDiscord.discord) !== null && _a !== void 0 ? _a : discordClientSingleton();
globalForDiscord.discord = exports.discordClient;
