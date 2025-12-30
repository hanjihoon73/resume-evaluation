import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "이력서 평가 AI 서비스",
    description: "LLM 기반 실시간 이력서 분석 및 리포트 제공 서비스",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Outfit:wght@700&display=swap" rel="stylesheet" />
            </head>
            <body>
                <main>{children}</main>
            </body>
        </html>
    );
}
