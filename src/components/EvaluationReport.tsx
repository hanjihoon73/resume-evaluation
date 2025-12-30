import { Star, CheckCircle, AlertTriangle, Download, FileText, List, User, Award } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import ResumePDF from './ResumePDF';

interface EvaluationReportProps {
    data: any;
    onBack?: () => void;
}

const EvaluationReport: React.FC<EvaluationReportProps> = ({ data, onBack }) => {
    const handleDownload = async () => {
        const doc = <ResumePDF data={data} />;
        const asPdf = pdf(doc);
        const blob = await asPdf.toBlob();
        const fileName = `분석리포트_${data.channel || '채널'}_${data.position || '포지션'}_${data.candidate_name || '지원자'}.pdf`.replace(/\s+/g, '');
        saveAs(blob, fileName);
    };

    return (
        <div className="evaluation-report" style={{ animation: "fadeIn 0.8s ease-out", maxWidth: "1000px", margin: "0 auto" }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
                <div>
                    <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>지원자 분석 리포트</h2>
                    <p style={{ color: "rgba(255,255,255,0.5)" }}>데이터 기반 정밀 AI 평가 결과입니다.</p>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                    {onBack && (
                        <button onClick={onBack} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.8rem 1.5rem", borderRadius: "12px", fontWeight: 600 }}>
                            <List size={20} />
                            목록으로
                        </button>
                    )}
                    <button onClick={handleDownload} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.8rem 1.5rem", borderRadius: "12px", fontWeight: 600 }}>
                        <Download size={20} />
                        PDF 다운로드
                    </button>
                </div>
            </header>

            {/* 지원자 기본 정보 섹션 */}
            <section className="premium-card" style={{ marginBottom: "2rem", padding: "2rem" }}>
                <h3 style={{ fontSize: "1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)" }}>
                    <User size={20} /> 지원자 기본 정보
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.5rem" }}>
                    <InfoItem label="이름" value={data.candidate_name} />
                    <InfoItem label="연락처" value={data.contact} />
                    <InfoItem label="이메일" value={data.email} />
                    <InfoItem label="지원채널" value={data.channel} />
                    <InfoItem label="지원포지션" value={data.position} />
                    <InfoItem label="최종학력" value={data.education} />
                    <InfoItem label="전공" value={data.major} />
                    <InfoItem label="학점" value={data.gpa} />
                </div>
            </section>

            {/* 종합 평가 섹션 */}
            <section className="premium-card" style={{ marginBottom: "2.5rem", background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))", padding: "3rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "3rem", alignItems: "center" }}>
                    <div style={{ textAlign: "center", borderRight: "1px solid var(--glass-border)", paddingRight: "3rem" }}>
                        <span style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.6)" }}>종합 평가 점수</span>
                        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "0.5rem", marginTop: "1rem" }}>
                            <span style={{ fontSize: "5.5rem", fontWeight: 800, color: "var(--primary)" }}>{data.total_score || 0}</span>
                            <span style={{ fontSize: "1.8rem", color: "rgba(255,255,255,0.3)" }}>/ 500</span>
                        </div>
                    </div>
                    <div>
                        <h3 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.8rem", fontSize: "1.4rem" }}>
                            <CheckCircle size={28} color="var(--success)" /> 핵심 통합 분석 (3회 합산)
                        </h3>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            {(data.top_strengths || []).map((s: string, i: number) => (
                                <li key={i} style={{ marginBottom: "1rem", paddingLeft: "1.8rem", position: "relative", fontSize: "1.15rem", lineHeight: 1.6, color: "rgba(255,255,255,0.9)" }}>
                                    <span style={{ position: "absolute", left: 0, color: "var(--primary)", fontWeight: "bold" }}>•</span> {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* 통합 상세 분석 데이터 */}
            <section>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {(data.detailed_analysis || []).map((item: any, i: number) => {
                        const score = data.scorecard?.[item.title] || 0;
                        return (
                            <div key={i} className="premium-card" style={{ padding: "2.5rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--glass-border)", paddingBottom: "1.5rem" }}>
                                    <h4 style={{ color: "var(--primary)", fontSize: "1.4rem", display: "flex", alignItems: "center", gap: "0.6rem", fontWeight: 700 }}>
                                        <Award size={24} /> {item.title}
                                    </h4>
                                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
                                        <span style={{ fontSize: "2.4rem", fontWeight: 800 }}>{score}</span>
                                        <span style={{ fontSize: "1rem", color: "rgba(255,255,255,0.3)" }}>/ 100</span>
                                    </div>
                                </div>
                                <div style={{ fontSize: "1.1rem", lineHeight: 1.8, color: "rgba(255,255,255,0.85)", whiteSpace: "pre-wrap" }}>
                                    {item.content}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
    <div>
        <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.3rem" }}>{label}</div>
        <div style={{ fontSize: "1rem", fontWeight: 500 }}>{(!value || value === "미기재" || value === "N/A") ? "-" : value}</div>
    </div>
);

export default EvaluationReport;
