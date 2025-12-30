import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
    family: 'Pretendard',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/packages/pretendard/dist/public/static/Pretendard-Regular.otf', fontWeight: 400 },
        { src: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/packages/pretendard/dist/public/static/Pretendard-Bold.otf', fontWeight: 700 },
    ]
});

const styles = StyleSheet.create({
    page: { padding: 40, backgroundColor: '#ffffff', fontFamily: 'Pretendard' },
    header: { marginBottom: 20, borderBottom: '2 solid #6366f1', paddingBottom: 15 },
    title: { fontSize: 24, color: '#1e293b', fontWeight: 'bold', marginBottom: 5 },
    subtitle: { fontSize: 10, color: '#64748b' },
    infoSection: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20, padding: 15, backgroundColor: '#f8fafc', borderRadius: 8, border: '1 solid #e2e8f0' },
    infoItem: { width: '33%', marginBottom: 10 },
    infoLabel: { fontSize: 8, color: '#64748b', marginBottom: 2 },
    infoValue: { fontSize: 10, color: '#1e293b', fontWeight: 'bold' },
    totalScoreBox: { backgroundColor: '#ebf1ff', padding: 20, borderRadius: 8, marginBottom: 20, alignItems: 'center' },
    totalScoreLabel: { fontSize: 12, color: '#4f46e5', marginBottom: 5 },
    totalScoreValue: { fontSize: 32, color: '#1e1b4b', fontWeight: 'bold' },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 16, color: '#4f46e5', marginBottom: 10, fontWeight: 'bold', borderLeft: '4 solid #6366f1', paddingLeft: 10 },
    card: { padding: 15, marginBottom: 10, backgroundColor: '#ffffff', border: '1 solid #f1f5f9', borderRadius: 6 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderBottom: '1 solid #f1f5f9', paddingBottom: 5 },
    cardTitle: { fontSize: 12, fontWeight: 'bold', color: '#1e293b' },
    cardScore: { fontSize: 14, fontWeight: 'bold', color: '#6366f1' },
    content: { fontSize: 9, color: '#334155', lineHeight: 1.6 }
});

interface ResumePDFProps {
    data: any;
}

const ResumePDF: React.FC<ResumePDFProps> = ({ data }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>지원자 분석 리포트</Text>
                <Text style={styles.subtitle}>데이터 기반 정밀 AI 평가 (3회 분석 합성)</Text>
            </View>

            <View style={styles.infoSection}>
                <View style={styles.infoItem}><Text style={styles.infoLabel}>이름</Text><Text style={styles.infoValue}>{data.candidate_name || "-"}</Text></View>
                <View style={styles.infoItem}><Text style={styles.infoLabel}>연락처</Text><Text style={styles.infoValue}>{data.contact || "-"}</Text></View>
                <View style={styles.infoItem}><Text style={styles.infoLabel}>이메일</Text><Text style={styles.infoValue}>{data.email || "-"}</Text></View>
                <View style={styles.infoItem}><Text style={styles.infoLabel}>지원채널</Text><Text style={styles.infoValue}>{data.channel || "-"}</Text></View>
                <View style={styles.infoItem}><Text style={styles.infoLabel}>지원포지션</Text><Text style={styles.infoValue}>{data.position || "-"}</Text></View>
                <View style={styles.infoItem}><Text style={styles.infoLabel}>최종학력</Text><Text style={styles.infoValue}>{data.education || "-"}</Text></View>
                <View style={styles.infoItem}><Text style={styles.infoLabel}>전공/학점</Text><Text style={styles.infoValue}>{(data.major && data.major !== "-") ? data.major : "-"} / {(data.gpa && data.gpa !== "-") ? data.gpa : "-"}</Text></View>
            </View>

            <View style={styles.totalScoreBox}>
                <Text style={styles.totalScoreLabel}>종합 평가 점수</Text>
                <Text style={styles.totalScoreValue}>{data.total_score || 0} / 500</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>핵심 통합 분석</Text>
                <View>
                    {(data.top_strengths || []).map((s: string, i: number) => (
                        <Text key={i} style={[styles.content, { marginBottom: 4 }]}>• {s}</Text>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>상세 평가 및 항목별 분석</Text>
                {(data.detailed_analysis || []).map((item: any, i: number) => {
                    const score = data.scorecard?.[item.title] || 0;
                    return (
                        <View key={i} style={styles.card} wrap={false}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Text style={styles.cardScore}>{score} / 100</Text>
                            </View>
                            <Text style={styles.content}>{item.content}</Text>
                        </View>
                    );
                })}
            </View>
        </Page>
    </Document>
);

export default ResumePDF;
