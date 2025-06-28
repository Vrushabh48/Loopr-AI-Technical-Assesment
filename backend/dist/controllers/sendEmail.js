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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = exports.resend = void 0;
// utils/resend.ts
const resend_1 = require("resend");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.resend = new resend_1.Resend(process.env.RESEND_API_KEY);
const sendWelcomeEmail = (email, username) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield exports.resend.emails.send({
            from: 'Penta <onboarding@resend.dev>',
            to: email,
            subject: 'Welcome to MyApp 🎉',
            html: `<p>Hi ${username},</p><p>This is an Confirmation regarding your signup.</p><p>We're excited to have you onboard 🚀</p>`,
        });
        console.log('Welcome email sent to', email);
        return data;
    }
    catch (error) {
        console.error('Failed to send welcome email:', error);
    }
});
exports.sendWelcomeEmail = sendWelcomeEmail;
