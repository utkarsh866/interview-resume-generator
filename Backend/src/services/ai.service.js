import { GoogleGenAI, Type } from "@google/genai";
import puppeteer from "puppeteer";

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

const interviewReportSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "The title of the job for which the interview report is generated"
        },
        matchScore: {
            type: Type.NUMBER,
            description: "A score between 0 and 100 indicating how well the candidate's profile matches the job description"
        },
        technicalQuestions: {
            type: Type.ARRAY,
            description: "Technical questions that can be asked in the interview along with their intention and how to answer them",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: {
                        type: Type.STRING,
                        description: "The technical question can be asked in the interview"
                    },
                    intention: {
                        type: Type.STRING,
                        description: "The intention of interviewer behind asking this question"
                    },
                    answer: {
                        type: Type.STRING,
                        description: "How to answer this question, what points to cover, what approach to take etc."
                    }
                },
                required: ["question", "intention", "answer"]
            }
        },
        behavioralQuestions: {
            type: Type.ARRAY,
            description: "Behavioral questions that can be asked in the interview along with their intention and how to answer them",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: {
                        type: Type.STRING,
                        description: "The behavioral question can be asked in the interview"
                    },
                    intention: {
                        type: Type.STRING,
                        description: "The intention of interviewer behind asking this question"
                    },
                    answer: {
                        type: Type.STRING,
                        description: "How to answer this question, what points to cover, what approach to take etc."
                    }
                },
                required: ["question", "intention", "answer"]
            }
        },
        skillGaps: {
            type: Type.ARRAY,
            description: "List of skill gaps in the candidate's profile along with their severity",
            items: {
                type: Type.OBJECT,
                properties: {
                    skill: {
                        type: Type.STRING,
                        description: "The skill which the candidate is lacking"
                    },
                    severity: {
                        type: Type.STRING,
                        enum: ["low", "medium", "high"],
                        description: "The severity of this skill gap: low, medium, or high"
                    }
                },
                required: ["skill", "severity"]
            }
        },
        preparationPlan: {
            type: Type.ARRAY,
            description: "A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively",
            items: {
                type: Type.OBJECT,
                properties: {
                    day: {
                        type: Type.NUMBER,
                        description: "The day number in the preparation plan, starting from 1"
                    },
                    focus: {
                        type: Type.STRING,
                        description: "The main focus of this day in the preparation plan"
                    },
                    tasks: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING
                        },
                        description: "List of tasks to be done on this day"
                    }
                },
                required: ["day", "focus", "tasks"]
            }
        }
    },
    required: [
        "title",
        "matchScore",
        "technicalQuestions",
        "behavioralQuestions",
        "skillGaps",
        "preparationPlan"
    ]
};

const resumePdfSchema = {
    type: Type.OBJECT,
    properties: {
        html: {
            type: Type.STRING,
            description: "The HTML content of the resume which can be converted to PDF using puppeteer"
        }
    },
    required: ["html"]
};

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription
}) {
    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}
`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: interviewReportSchema
        }
    });

    return JSON.parse(response.text);
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch();

    try {
        const page = await browser.newPage();

        await page.setContent(htmlContent, {
            waitUntil: "networkidle0"
        });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            preferCSSPageSize: true,
            pageRanges: "1",
            margin: {
                top: "8mm",
                bottom: "8mm",
                left: "12mm",
                right: "12mm"
            }
        });

        return pdfBuffer;
    } finally {
        await browser.close();
    }
}

async function generateResumePdf({
    resume,
    selfDescription,
    jobDescription
}) {
    const prompt = `You are an expert resume writer and typesetter. Generate an ATS-optimized, LaTeX-style single-page software engineer resume in clean HTML with embedded CSS, matching the classic Jake's Resume / Overleaf academic serif layout.

Candidate Details / Raw Resume:
${resume}

Candidate Self Description:
${selfDescription}

Target Job Description:
${jobDescription}

CRITICAL FORMATTING & STRUCTURE RULES:
1. EXACTLY ONE SINGLE PAGE: The resume MUST fit cleanly onto EXACTLY ONE SINGLE A4 PAGE. It must NEVER overflow or spill onto a second page.
2. NO PROFESSIONAL SUMMARY: Do NOT generate a "Professional Summary", "Objective", or "About Me" section. It wastes vertical space. Begin directly with EDUCATION, then EXPERIENCE, PROJECTS, TECHNICAL SKILLS, and CERTIFICATES & ACHIEVEMENTS.
3. SERIF TYPOGRAPHY (LaTeX Style): Use 'Times New Roman', Times, Cambria, Georgia, serif for the entire resume to give it a clean, elegant, professional look.
4. SECTION DIVIDERS: Each section heading must be uppercase with a crisp 1px solid black underline spanning the full width (border-bottom: 1px solid #000).
5. FLEX ROWS FOR HEADERS: All job titles, degrees, and project headers MUST use two-column flex rows (display: flex; justify-content: space-between; align-items: baseline;) so dates and locations are neatly aligned to the right margin.
6. CONTENT DEPTH & BULLET QUALITY:
   - For Experience: 3 impactful bullet points tailored to the job description, emphasizing technologies (Java, Spring Boot, React, etc.), architecture, performance, and quantifiable achievements.
   - For Projects: Exactly 3 top projects (Real Estate Management System, Vehicle Rental System, City Information Website). Each project must have 3-4 bullet points highlighting key features, databases, APIs, and performance.
   - For Technical Skills: Clean categorized format with bold labels (Languages, Frameworks, Developer Tools, Relevant Coursework, Database).
   - For Certificates & Achievements: List CodeVita rank and HackerRank certifications as clean single-line bullets.

EMBED THE FOLLOWING CSS EXACTLY INSIDE <style> IN <head>:
<style>
@page {
    size: A4;
    margin: 8mm 12mm 8mm 12mm;
}
* {
    box-sizing: border-box;
}
html, body {
    margin: 0;
    padding: 0;
    font-family: 'Times New Roman', Times, Cambria, Georgia, serif;
    font-size: 9.3pt;
    line-height: 1.25;
    color: #111;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}
.resume {
    width: 100%;
    margin: 0;
    padding: 0;
}
.header {
    text-align: center;
    margin-bottom: 6px;
}
.header h1 {
    font-size: 20pt;
    font-weight: bold;
    margin: 0 0 2px 0;
    letter-spacing: 0.5px;
    font-family: 'Times New Roman', Times, serif;
}
.contact-line {
    font-size: 9.2pt;
    margin: 0;
    color: #222;
}
.contact-line a {
    color: #111;
    text-decoration: underline;
}
h2.section-title {
    font-size: 10.5pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    border-bottom: 1px solid #000;
    margin: 6px 0 3px 0;
    padding-bottom: 1px;
}
.entry {
    margin-bottom: 4px;
}
.row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 9.3pt;
}
.row-bold {
    font-weight: bold;
}
.row-italic {
    font-style: italic;
}
ul.bullet-list {
    margin: 2px 0 4px 0;
    padding-left: 18px;
}
ul.bullet-list li {
    font-size: 9.1pt;
    line-height: 1.25;
    margin-bottom: 1.5px;
}
.skills-line {
    font-size: 9.2pt;
    line-height: 1.32;
    margin-bottom: 2px;
}
.skills-line strong {
    font-weight: bold;
}
@media print {
    body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
}
</style>

HTML BLUEPRINT (Structure and class naming):
<div class="resume">
  <div class="header">
    <h1>Utkarsh Singh</h1>
    <div class="contact-line">
      7007928369 &nbsp;|&nbsp; <a href="mailto:utkarshsingh866@gmail.com">utkarshsingh866@gmail.com</a> &nbsp;|&nbsp; <a href="...">Linkedin</a> &nbsp;|&nbsp; <a href="...">Github</a>
    </div>
  </div>

  <h2 class="section-title">Education</h2>
  <div class="entry">
    <div class="row"><span class="row-bold">Pranveer Singh Institute of Technology</span><span>Kanpur Nagar, UP</span></div>
    <div class="row"><span class="row-italic">Bachelor of Technology in Computer Science and Engineering CGPA: 8.08</span><span class="row-italic">Dec. 2020 – June 2024</span></div>
  </div>
  <div class="entry">
    <div class="row"><span class="row-bold">Children senior Secondary School</span><span>Azamgarh, UP</span></div>
    <div class="row"><span class="row-italic">Intermediate Percentage: 74.5</span><span class="row-italic">April 2018 – May 2019</span></div>
  </div>

  <h2 class="section-title">Experience</h2>
  <div class="entry">
    <div class="row"><span class="row-bold">System Engineer</span><span>May 2024 – Present</span></div>
    <div class="row"><span class="row-italic">Tata Consultancy Services</span><span class="row-italic">Pune, India</span></div>
    <ul class="bullet-list">
      <li>...</li>
      <li>...</li>
      <li>...</li>
    </ul>
  </div>

  <h2 class="section-title">Projects</h2>
  <div class="entry">
    <div class="row"><span class="row-bold">Real Estate Management System - <a href="...">Link</a> | ReactJS, Node.js, Firebase, Express.js, MongoDB</span><span>Feb 2024 – Mar 2024</span></div>
    <ul class="bullet-list">
      <li>...</li>
      <li>...</li>
      <li>...</li>
    </ul>
  </div>
  <div class="entry">
    <div class="row"><span class="row-bold">Vehicle Rental System - <a href="...">Link</a> | React.js, Node.js, Express.js, MongoDB</span><span>Aug 2023 – Jan 2024</span></div>
    <ul class="bullet-list">
      <li>...</li>
      <li>...</li>
      <li>...</li>
    </ul>
  </div>
  <div class="entry">
    <div class="row"><span class="row-bold">City Information Website - <a href="...">Link</a> | React.js, Tailwind CSS</span><span>June 2023 – Aug 2023</span></div>
    <ul class="bullet-list">
      <li>...</li>
      <li>...</li>
    </ul>
  </div>

  <h2 class="section-title">Technical Skills</h2>
  <div class="skills-line"><strong>Languages:</strong> Python, C/C++, SQL, JavaScript, HTML/CSS, Java</div>
  <div class="skills-line"><strong>Frameworks:</strong> React, Node.js, Next.js, Material-UI, Tailwind CSS, Spring Boot, Express.js</div>
  <div class="skills-line"><strong>Developer Tools:</strong> Git, VS Code, Visual Studio, PyCharm, IntelliJ, Postman</div>
  <div class="skills-line"><strong>Relevant Coursework:</strong> Data Structures & Algorithms, Object Oriented Programming, Database Management System</div>
  <div class="skills-line"><strong>Database:</strong> MongoDB, SQL, Firebase</div>

  <h2 class="section-title">Certificates & Achievements</h2>
  <ul class="bullet-list">
    <li>Frontend Developer (React) in HackerRank</li>
    <li>Javascript intermediate in HackerRank</li>
    <li>TCS CODEVITA SEASON 11: GLOBAL RANK 2798</li>
  </ul>
</div>

The response must be a JSON object with a single field "html" containing the full HTML string.`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: resumePdfSchema
        }
    });

    const jsonContent = JSON.parse(response.text);

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

    return pdfBuffer;
}

export {
    generateInterviewReport,
    generateResumePdf
};
