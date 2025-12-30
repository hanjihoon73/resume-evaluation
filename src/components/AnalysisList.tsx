import React from 'react';
import { FileText, User, Mail, GraduationCap, Award, ChevronRight, RotateCcw } from 'lucide-react';

interface AnalysisListProps {
    results: any[];
    onShowReport: (result: any) => void;
    onReset: () => void;
}

const AnalysisList: React.FC<AnalysisListProps> = ({ results, onShowReport, onReset }) => {
    // 파일명 파싱 (지원채널_포지션_이름)
    const parseFileName = (fileName: string) => {
        const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
        const parts = nameWithoutExt.split("_").map(p => p.trim().replace(/\s+/g, ''));
        return {
            channel: parts[0] || "-",
            position: parts[1] || "-",
            name: parts[2] || nameWithoutExt
        };
    };

    return (
        <div className="analysis-list" style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
                <div>
                    <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem", fontWeight: 700 }}>지원자 분석 결과</h2>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "1.1rem" }}>총 {results.length}명의 지원자가 분석되었습니다.</p>
                </div>
                <button onClick={onReset} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.8rem 1.5rem", borderRadius: "12px", fontWeight: 600 }}>
                    <RotateCcw size={18} />
                    새로 분석하기
                </button>
            </header>

            <div className="premium-card" style={{ padding: 0, overflow: "hidden", border: "1px solid var(--glass-border)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid var(--glass-border)" }}>
                        <tr>
                            <th style={{ padding: "1.4rem 1.5rem", color: "rgba(255,255,255,0.6)", fontWeight: 600, fontSize: "0.95rem" }}>지원채널</th>
                            <th style={{ padding: "1.4rem 1.5rem", color: "rgba(255,255,255,0.6)", fontWeight: 600, fontSize: "0.95rem" }}>포지션</th>
                            <th style={{ padding: "1.4rem 1.5rem", color: "rgba(255,255,255,0.6)", fontWeight: 600, fontSize: "0.95rem" }}>이름</th>
                            <th style={{ padding: "1.4rem 1.5rem", color: "var(--primary)", fontWeight: 700, textAlign: "center", fontSize: "0.95rem" }}>종합 점수</th>
                            <th style={{ padding: "1.4rem 1.5rem", textAlign: "right" }}>작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((result, index) => {
                            const fileInfo = parseFileName(result.fileName || "");
                            return (
                                <tr key={index} style={{ borderBottom: "1px solid var(--glass-border)", transition: "background 0.2s" }} className="table-row-hover">
                                    <td style={{ padding: "1.4rem 1.5rem" }}>{result.channel || fileInfo.channel}</td>
                                    <td style={{ padding: "1.4rem 1.5rem" }}><span className="badge">{result.position || fileInfo.position}</span></td>
                                    <td style={{ padding: "1.4rem 1.5rem", fontWeight: 600, fontSize: "1.05rem" }}>{(result.candidate_name && result.candidate_name !== "미기재") ? result.candidate_name : fileInfo.name}</td>
                                    <td style={{ padding: "1.4rem 1.5rem", textAlign: "center" }}>
                                        <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--primary)" }}>{result.total_score}</div>
                                    </td>
                                    <td style={{ padding: "1.4rem 1.5rem", textAlign: "right" }}>
                                        <button onClick={() => onShowReport(result)} className="btn-primary" style={{ padding: "0.6rem 1.2rem", fontSize: "0.9rem", borderRadius: "10px", fontWeight: 600 }}>
                                            리포트 보기
                                            <ChevronRight size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <style jsx>{`
                .table-row-hover:hover {
                    background: rgba(255, 255, 255, 0.02);
                }
                .badge {
                    background: rgba(99, 102, 241, 0.1);
                    color: var(--primary);
                    padding: 0.2rem 0.6rem;
                    borderRadius: 4px;
                    fontSize: 0.8rem;
                }
            `}</style>
        </div>
    );
};

export default AnalysisList;
