import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdf from "pdf-parse";
import fs from "fs";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
// 할당량 최적화를 위해 Gemini 2.5 Flash 모델 적용
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
    }
});

const KEY_MAP: Record<string, string> = {
    "relevant_major": "관련 전공",
    "tenure": "근속 기간",
    "tech_stack": "기술 스택",
    "ai_capability": "AI 역량",
    "culture_fit": "컬처핏"
};

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "파일이 업로드되지 않았습니다." }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let resumeText = "";

        try {
            if (file.name.endsWith(".pdf")) {
                const data = await pdf(buffer);
                resumeText = data.text;
            } else if (file.name.endsWith(".md")) {
                resumeText = buffer.toString("utf-8");
            } else {
                return NextResponse.json({ error: "지원하지 않는 파일 형식입니다. (PDF, MD만 가능)" }, { status: 400 });
            }
        } catch (pdfError: any) {
            console.error("PDF Parsing Error:", pdfError);
            return NextResponse.json({ error: "파일 내용을 읽는 중 오류가 발생했습니다." }, { status: 400 });
        }

        if (!resumeText.trim()) {
            return NextResponse.json({ error: "추출된 텍스트가 없습니다. 유효한 파일인지 확인해 주세요." }, { status: 400 });
        }

        const fileName = file.name.replace(/\.[^/.]+$/, "");
        const fileNameParts = fileName.split("_").map(p => p.trim());
        const defaultChannel = fileNameParts[0] || "-";
        const defaultPosition = fileNameParts[1] || "-";
        const defaultName = (fileNameParts[2] || fileName).replace(/\s+/g, '');

        let template = "";
        try {
            const templatePath = path.join(process.cwd(), "docs", "backend_resume_evaluation_template.md");
            template = fs.readFileSync(templatePath, "utf-8");
        } catch (e) {
            console.warn("Template file not found.");
        }

        const evaluationPrompt = `
당신은 전설적인 채용 전문가이자 테크 리드입니다. 
아래 이력서를 정밀하게 분석하고 반드시 JSON으로만 응답하세요.

[이력서 내용]
${resumeText.substring(0, 15000)}

[JSON 키 매핑]
- "관련 전공" -> relevant_major
- "근속 기간" -> tenure
- "기술 스택" -> tech_stack
- "AI 역량" -> ai_capability
- "컬처핏" -> culture_fit

[지침]
1. education(학력)은 이력서 내용을 바탕으로 '학사', '석사', '박사' 중 하나로만 분류하세요. 
2. 해당 정보가 전혀 없거나 판단이 불가능한 경우에만 "-"를 사용하세요.
3. 다른 인적 사항 정보도 없는 경우 "N/A"나 "미기재" 대신 반드시 "-"를 사용하세요.

[응답 JSON 스키마]
{
  "candidate_name": "성함",
  "contact": "연락처",
  "email": "이메일",
  "education": "학사/석사/박사 중 선택",
  "major": "전공",
  "gpa": "학점",
  "channel": "지원채널",
  "position": "지원포지션",
  "total_score": 0,
  "top_strengths": ["강점1", "강점2", "강점3"],
  "scorecard": {
    "relevant_major": 0,
    "tenure": 0,
    "tech_stack": 0,
    "ai_capability": 0,
    "culture_fit": 0
  },
  "detailed_analysis": [
    { "key": "relevant_major", "content": "종합 분석 내용" },
    { "key": "tenure", "content": "..." },
    { "key": "tech_stack", "content": "..." },
    { "key": "ai_capability", "content": "..." },
    { "key": "culture_fit", "content": "..." }
  ]
}
`;

        const runAnalysis = async (retryCount = 0): Promise<any> => {
            try {
                const result = await model.generateContent(evaluationPrompt);
                const text = result.response.text();
                let parsed;
                try {
                    parsed = JSON.parse(text);
                } catch (e) {
                    const match = text.match(/\{[\s\S]*\}/);
                    parsed = match ? JSON.parse(match[0]) : null;
                }

                if (parsed && parsed.scorecard) return parsed;
                throw new Error("Invalid structure");
            } catch (e: any) {
                console.error(`Gemini 2.5 Analysis fail (${retryCount + 1}):`, e.message);
                if (retryCount < 1) return runAnalysis(retryCount + 1);
                return null;
            }
        };

        const analysisResults = await Promise.all([runAnalysis(), runAnalysis(), runAnalysis()]);
        const results = analysisResults.filter(r => r !== null);

        if (results.length === 0) {
            return NextResponse.json({ error: "Gemini 2.5 분석 엔진 시뮬레이션 중 오류가 발생했습니다. API 키와 할당량을 확인해 주세요." }, { status: 500 });
        }

        const getVal = (f: string) => {
            const val = results.find(r => r[f] && r[f] !== "미기재" && r[f] !== "N/A" && r[f] !== "-")?.[f];
            return val || null;
        };

        const averagedResults = {
            candidate_name: (getVal("candidate_name") || defaultName).replace(/\s+/g, ''),
            contact: getVal("contact") || "-",
            email: getVal("email") || "-",
            education: getVal("education") || "-",
            major: getVal("major") || "-",
            gpa: getVal("gpa") || "-",
            channel: getVal("channel") || defaultChannel,
            position: getVal("position") || defaultPosition,
            scorecard: {
                "관련 전공": Math.round(results.reduce((a, c) => a + (Number(c.scorecard?.relevant_major) || 0), 0) / results.length),
                "근속 기간": Math.round(results.reduce((a, c) => a + (Number(c.scorecard?.tenure) || 0), 0) / results.length),
                "기술 스택": Math.round(results.reduce((a, c) => a + (Number(c.scorecard?.tech_stack) || 0), 0) / results.length),
                "AI 역량": Math.round(results.reduce((a, c) => a + (Number(c.scorecard?.ai_capability) || 0), 0) / results.length),
                "컬처핏": Math.round(results.reduce((a, c) => a + (Number(c.scorecard?.culture_fit) || 0), 0) / results.length),
            } as Record<string, number>,
        };

        const totalScore = Object.values(averagedResults.scorecard).reduce((a, b) => a + b, 0);

        const synthesisPrompt = `아래 3회의 분석 결과 중 학력 정보를 '학사', '석사', '박사' 중 하나로 확정하고(정보 없을시 '-'), 나머지 정보를 전문적으로 통합하여 JSON으로 응답하세요: ${JSON.stringify(results)}`;

        try {
            const synthRes = await model.generateContent(synthesisPrompt);
            const synthText = synthRes.response.text();
            let finalContent;
            try {
                finalContent = JSON.parse(synthText);
            } catch (e) {
                const match = synthText.match(/\{[\s\S]*\}/);
                finalContent = match ? JSON.parse(match[0]) : results[0];
            }

            const detailedWithTitles = (finalContent.detailed_analysis || results[0].detailed_analysis || []).map((item: any) => ({
                title: KEY_MAP[item.key] || item.key || "평가 항목",
                content: item.content || "-"
            }));

            return NextResponse.json({
                ...averagedResults,
                total_score: totalScore,
                top_strengths: finalContent.top_strengths || results[0].top_strengths || [],
                detailed_analysis: detailedWithTitles
            });
        } catch (e) {
            return NextResponse.json({
                ...averagedResults,
                total_score: totalScore,
                top_strengths: results[0].top_strengths || [],
                detailed_analysis: (results[0].detailed_analysis || []).map((item: any) => ({
                    title: KEY_MAP[item.key] || item.key,
                    content: item.content || "-"
                }))
            });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
