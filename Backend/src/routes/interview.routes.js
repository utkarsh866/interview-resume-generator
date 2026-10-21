import express from "express";
import interviewController from "../controllers/interview.controller.js";
import authUser from "../middlewares/auth.middleware.js";
import upload from "../middlewares/file.middleware.js";

const interviewRouter = express.Router();

// Generate interview report
interviewRouter.post(
    "/",
    authUser,
    upload.single("resume"),
    interviewController.generateInterViewReportController
);

// Get a specific interview report
interviewRouter.get(
    "/report/:interviewId",
    authUser,
    interviewController.getInterviewReportByIdController
);

// Get all interview reports
interviewRouter.get(
    "/",
    authUser,
    interviewController.getAllInterviewReportsController
);

// Generate resume PDF
interviewRouter.post(
    "/resume/pdf/:interviewReportId",
    authUser,
    interviewController.generateResumePdfController
);

export default interviewRouter;