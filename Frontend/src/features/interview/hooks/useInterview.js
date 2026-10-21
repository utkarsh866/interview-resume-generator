import {
    getAllInterviewReports,
    generateInterviewReport,
    getInterviewReportById,
    generateResumePdf
} from "../services/interview.api";
import { useContext, useCallback } from "react";
import { InterviewContext } from "../interview.context";

export const useInterview = () => {
    const context = useContext(InterviewContext);

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider");
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context;

    const generateReport = useCallback(async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true);
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile });
            const interviewReport = response?.interviewReport || null;
            if (interviewReport) {
                setReport(interviewReport);
            }
            return interviewReport;
        } finally {
            setLoading(false);
        }
    }, [setLoading, setReport]);

    const getReportById = useCallback(async (interviewId) => {
        if (!interviewId) return null;
        setLoading(true);
        try {
            const response = await getInterviewReportById(interviewId);
            const interviewReport = response?.interviewReport || null;
            setReport(interviewReport);
            return interviewReport;
        } catch (error) {
            console.error("Error fetching report by id:", error);
            setReport(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, [setLoading, setReport]);

    const getReports = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAllInterviewReports();
            const interviewReports = response?.interviewReports || [];
            setReports(interviewReports);
            return interviewReports;
        } catch (error) {
            console.error("Error fetching all reports:", error);
            setReports([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, [setLoading, setReports]);

    const getResumePdf = useCallback(async (interviewReportId) => {
        const response = await generateResumePdf({ interviewReportId });
        const url = window.URL.createObjectURL(new Blob([response], { type: "application/pdf" }));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `resume_${interviewReportId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }, []);

    return {
        loading,
        report,
        reports,
        generateReport,
        getReportById,
        getReports,
        getResumePdf
    };
};
