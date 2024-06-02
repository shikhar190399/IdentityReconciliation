"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./router/routes"));
const connect_1 = require("./database/connect");
const NAMESPACE = 'SERVER CONNECTION';
const app = (0, express_1.default)();
const port = process.env.PORT;
app.use(express_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)({ origin: '*', methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH', 'OPTIONS'] }));
app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message });
});
app.use('/app', routes_1.default);
app.get('/', (req, res) => {
    res.send("Hello from World");
});
app.listen(port, () => {
    console.info(`connect to server on port on ${port}`);
    (0, connect_1.connect)();
});
