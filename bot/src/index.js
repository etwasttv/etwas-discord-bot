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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var promises_1 = require("fs/promises");
var path_1 = require("path");
var discord_js_1 = require("discord.js");
var discord_client_1 = require("./core/discord-client");
var BOT_TOKEN = "";
function addEventListener() {
    return __awaiter(this, void 0, void 0, function () {
        var files;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, promises_1.readdir)(path_1.default.resolve(__dirname, './events'), { recursive: true })];
                case 1:
                    files = (_a.sent())
                        .filter(function (f) { return path_1.default.extname(f) === '.ts' || path_1.default.extname(f) === '.js'; });
                    return [4 /*yield*/, Promise.all(files.map(function (file) { return __awaiter(_this, void 0, void 0, function () {
                            var event;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, Promise.resolve("".concat("./events/".concat(file))).then(function (s) { return require(s); })];
                                    case 1:
                                        event = (_a.sent()).default;
                                        if (!event)
                                            return [2 /*return*/];
                                        if (event.once) {
                                            //  execute only once
                                            discord_client_1.discordClient.once(event.eventName, function () {
                                                var args = [];
                                                for (var _i = 0; _i < arguments.length; _i++) {
                                                    args[_i] = arguments[_i];
                                                }
                                                return event.listener.apply(event, args);
                                            });
                                        }
                                        else {
                                            //  execute everytime
                                            discord_client_1.discordClient.on(event.eventName, function () {
                                                var args = [];
                                                for (var _i = 0; _i < arguments.length; _i++) {
                                                    args[_i] = arguments[_i];
                                                }
                                                return event.listener.apply(event, args);
                                            });
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, files.length];
            }
        });
    });
}
function registerCommand() {
    return __awaiter(this, void 0, void 0, function () {
        var commands, files;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    commands = new discord_js_1.Collection();
                    return [4 /*yield*/, (0, promises_1.readdir)(path_1.default.resolve(__dirname, './commands'))];
                case 1:
                    files = _a.sent();
                    return [4 /*yield*/, Promise.all(files.map(function (file) { return __awaiter(_this, void 0, void 0, function () {
                            var command, e_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, Promise.resolve("".concat("./commands/".concat(file))).then(function (s) { return require(s); })];
                                    case 1:
                                        command = (_a.sent()).default;
                                        if (!command)
                                            return [2 /*return*/];
                                        commands.set(command.builder.name, command);
                                        return [3 /*break*/, 3];
                                    case 2:
                                        e_1 = _a.sent();
                                        console.error(e_1);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 2:
                    _a.sent();
                    //  register
                    discord_client_1.discordClient.on(discord_js_1.Events.InteractionCreate, function (interaction) { return __awaiter(_this, void 0, void 0, function () {
                        var command, err_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (interaction.user.bot)
                                        return [2 /*return*/];
                                    if (!interaction.isCommand())
                                        return [2 /*return*/];
                                    command = commands.get(interaction.commandName);
                                    if (!command)
                                        return [2 /*return*/];
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 5]);
                                    //  execute
                                    return [4 /*yield*/, command.handler(interaction)];
                                case 2:
                                    //  execute
                                    _a.sent();
                                    return [3 /*break*/, 5];
                                case 3:
                                    err_1 = _a.sent();
                                    console.error(err_1);
                                    return [4 /*yield*/, interaction.reply({
                                            content: 'There was an error while executing this command!',
                                            ephemeral: true,
                                        })];
                                case 4:
                                    _a.sent();
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/, commands.size];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, eventNum, commandNum;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (BOT_TOKEN) {
                        console.log('TOKEN を指定して下さい');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, Promise.all([addEventListener(), registerCommand()])];
                case 1:
                    _a = _b.sent(), eventNum = _a[0], commandNum = _a[1];
                    console.log("".concat(eventNum, " \u500B\u306E\u30A4\u30D9\u30F3\u30C8\uFF0C").concat(commandNum, " \u500B\u306E\u30B3\u30DE\u30F3\u30C9\u3092\u767B\u9332\u3057\u307E\u3057\u305F"));
                    //  ログイン
                    console.log('Discord Botを起動します');
                    discord_client_1.discordClient.login(BOT_TOKEN);
                    return [2 /*return*/];
            }
        });
    });
}
main();
