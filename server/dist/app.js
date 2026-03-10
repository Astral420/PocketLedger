"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("passport"));
const passport_2 = require("./config/passport");
const routes_1 = __importDefault(require("./routes"));
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.use((0, cookie_parser_1.default)());
(0, passport_2.setupPassport)();
exports.app.use(passport_1.default.initialize());
exports.app.use("/api/v1", routes_1.default);
exports.app.get("/", (_req, res) => {
    res.send("BudgetTracker API is running!");
});
