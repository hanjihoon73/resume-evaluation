"use client";

import { useState } from "react";
import { Upload, FileText, Download, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import EvaluationReport from "@/components/EvaluationReport";
import AnalysisList from "@/components/AnalysisList";

export default function Home() {
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [selectedResult, setSelectedResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<'upload' | 'list' | 'report'>('upload');

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFiles = e.target.files;
        if (!uploadedFiles || uploadedFiles.length === 0) return;

        setUploading(true);
        setError(null);
        const newResults: any[] = [];

        try {
            for (let i = 0; i < uploadedFiles.length; i++) {
                const file = uploadedFiles[i];
                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch("/api/evaluate", {
                    method: "POST",
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    newResults.push({
                        ...data,
                        fileName: file.name
                    });
                } else {
                    const errorData = await response.json();
                    console.error(`${file.name} 분석 실패:`, errorData.error);
                    setError(`${file.name} 분석 실패: ${errorData.error || "알 수 없는 오류"}`);
                }
            }

            if (newResults.length > 0) {
                setResults(newResults);
                setView('list');
            }
        } catch (err: any) {
            setError(err.message || "서버와 통신 중 오류가 발생했습니다.");
        } finally {
            setUploading(false);
        }
    };

    const handleBackToUpload = () => {
        setResults([]);
        setSelectedResult(null);
        setError(null);
        setView('upload');
    };

    const handleShowReport = (result: any) => {
        setSelectedResult(result);
        setView('report');
    };

    const handleBackToList = () => {
        setSelectedResult(null);
        setView('list');
    };

    return (
        <main className="container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
            <div style={{ position: "absolute", top: "1.5rem", right: "2rem", color: "rgba(255,255,255,0.3)", fontSize: "0.9rem", fontWeight: 500 }}>
                v1.0
            </div>
            {view === 'upload' && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "4rem 2rem" }}>
                    <header style={{ textAlign: "center", marginBottom: "4rem" }}>
                        <h1 style={{ fontSize: "3.5rem", fontWeight: 800, marginBottom: "1rem", background: "linear-gradient(to right, #6366f1, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            지원자 분석 리포트
                        </h1>
                        <p style={{ fontSize: "1.25rem", color: "rgba(255,255,255,0.7)", maxWidth: "600px", margin: "0 auto" }}>
                            이력서를 업로드하고, AI가 분석한 전문적인 리포트를 즉시 확인하세요.
                        </p>
                    </header>

                    <div className="premium-card" style={{ width: "100%", maxWidth: "800px", padding: "4rem 2.5rem", position: "relative", textAlign: "center" }}>
                        <div style={{ border: "2px dashed var(--glass-border)", borderRadius: "20px", padding: "5rem 3rem", background: "rgba(255,255,255,0.01)", position: "relative" }}>
                            <Upload size={52} style={{ color: "var(--primary)", marginBottom: "1.5rem" }} />
                            <p style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}>{uploading ? "파일을 분석하고 있습니다..." : "PDF 또는 Markdown 파일을 이곳에 드래그하거나 선택하세요"}</p>
                            <input
                                type="file"
                                accept=".pdf,.md"
                                multiple
                                onChange={handleFileUpload}
                                id="file-upload"
                                style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", zIndex: 10 }}
                                disabled={uploading}
                            />
                            <label htmlFor="file-upload" className="btn-primary" style={{ cursor: "pointer", display: "inline-block", padding: "0.8rem 2rem", fontSize: "1rem", borderRadius: "12px" }}>
                                {uploading ? "분석 중..." : "파일 선택하기"}
                            </label>
                            <p style={{ marginTop: "1.5rem", fontSize: "0.9rem", color: "rgba(255,255,255,0.4)" }}>여러 개의 파일을 동시에 업로드하여 한 번에 분석할 수 있습니다.</p>
                        </div>
                        {uploading && (
                            <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center" }}>
                                <Loader2 size={36} className="animate-spin" style={{ color: "var(--primary)" }} />
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="premium-card" style={{ marginTop: "2rem", border: "1px solid var(--error)", color: "#ff6b6b", display: "flex", alignItems: "center", gap: "1rem", maxWidth: "800px" }}>
                            <AlertCircle size={20} />
                            <div style={{ textAlign: "left" }}>{error}</div>
                        </div>
                    )}
                </div>
            )}

            {view === 'list' && (
                <div style={{ padding: "4rem 0" }}>
                    <AnalysisList
                        results={results}
                        onShowReport={handleShowReport}
                        onReset={handleBackToUpload}
                    />
                </div>
            )}

            {view === 'report' && selectedResult && (
                <div style={{ padding: "4rem 0" }}>
                    <EvaluationReport
                        data={selectedResult}
                        onBack={handleBackToList}
                    />
                </div>
            )}

            <style jsx>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </main>
    );
}
