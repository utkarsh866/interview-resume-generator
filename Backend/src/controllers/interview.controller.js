import { PDFParse } from "pdf-parse";
import {
    generateInterviewReport,
    generateResumePdf
} from "../services/ai.service.js";
import interviewReportModel from "../models/interviewReport.model.js";

async function generateInterViewReportController(req, res) {
    let parser;

    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a resume PDF."
            });
        }

        parser = new PDFParse({
            data: new Uint8Array(req.file.buffer)
        });

        const resumeContent = await parser.getText();
        const resumeText = resumeContent.text;

        const { selfDescription, jobDescription } = req.body;

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        });

        const title = interViewReportByAi?.title
            || interViewReportByAi?.jobTitle
            || (jobDescription ? jobDescription.slice(0, 60).split('\n')[0].trim() : null)
            || "Interview Plan";

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            technicalQuestions: interViewReportByAi?.technicalQuestions || [],
            behavioralQuestions: interViewReportByAi?.behavioralQuestions || [],
            skillGaps: interViewReportByAi?.skillGaps || [],
            preparationPlan: interViewReportByAi?.preparationPlan || [],
            matchScore: interViewReportByAi?.matchScore ?? 0,
            ...interViewReportByAi,
            title
        });

        return res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        });
    } catch (error) {
        console.error("Generate interview report error:", error);

        return res.status(500).json({
            message: "Failed to generate interview report."
        });
    } finally {
        if (parser) {
            await parser.destroy();
        }
    }
}

async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params;

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewId,
            user: req.user.id
        });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        return res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        });
    } catch (error) {
        console.error("Get interview report error:", error);

        return res.status(500).json({
            message: "Failed to fetch interview report."
        });
    }
}

async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select(
                "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan"
            );

        return res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        });
    } catch (error) {
        console.error("Get all interview reports error:", error);

        return res.status(500).json({
            message: "Failed to fetch interview reports."
        });
    }
}

async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewReportId,
            user: req.user.id
        });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        const { resume, jobDescription, selfDescription } = interviewReport;

        const pdfBuffer = await generateResumePdf({
            resume,
            jobDescription,
            selfDescription
        });

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        });

        return res.send(pdfBuffer);
    } catch (error) {
        console.error("Generate resume PDF error:", error);

        return res.status(500).json({
            message: "Failed to generate resume PDF."
        });
    }
}

export default {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
};
