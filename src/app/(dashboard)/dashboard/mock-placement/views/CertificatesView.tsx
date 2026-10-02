"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { COMPANY_LOGOS } from "../components/mockData";
import { Award, Download, Sparkles, CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { mockPlacementService } from "@/services/mock-placement.service";

export default function CertificatesView() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<string | null>(null);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;
    const uid: string = userId;
    async function loadData() {
      setLoading(true);
      try {
        const data = await mockPlacementService.getHistory(uid);
        // Filter only selected/offered drives
        setHistory(data.filter(h => h.result === "Selected" || h.result === "Offered"));
      } catch (err) {
        console.error("Failed to load certificates history:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.id]);

  const getResultIcon = (r: string) => CheckCircle;
  const getResultColor = (r: string) => "text-emerald-600";

  const handleDownloadPDF = (cert: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download your certificate.");
      return;
    }

    const dateStr = new Date(cert.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const credentialId = `EN-MP-${cert.id.substring(0, 8).toUpperCase()}`;
    const studentName = user?.email ? user.email.split("@")[0].toUpperCase() : "EXAMNOVA STUDENT";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate of Completion - ${cert.company}</title>
          <meta charset="utf-8">
          <script src="https://cdn.tailwindcss.com"></script>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Montserrat:wght@400;500;600;700&family=Great+Vibes&display=swap" rel="stylesheet">
          <style>
            @page {
              size: landscape;
              margin: 0;
            }
            @media print {
              body {
                background: white !important;
                color: black !important;
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .no-print {
                display: none !important;
              }
              .cert-container {
                box-shadow: none !important;
                border: 16px double #d97706 !important;
                margin: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                box-sizing: border-box;
              }
            }
            body {
              font-family: 'Montserrat', sans-serif;
            }
            .title-font {
              font-family: 'Cinzel', serif;
            }
            .sig-font {
              font-family: 'Great Vibes', cursive;
            }
          </style>
        </head>
        <body class="bg-zinc-900 text-zinc-800 flex flex-col items-center justify-center min-h-screen p-4 overflow-auto">
          <div class="no-print mb-6 flex gap-4">
            <button onclick="window.print()" class="px-6 py-2.5 bg-aurora-primary hover:bg-aurora-primary-hover text-white font-extrabold rounded-xl shadow-lg cursor-pointer transition-all flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print / Save as PDF
            </button>
            <button onclick="window.close()" class="px-6 py-2.5 bg-aurora-card hover:bg-aurora-card-hover text-aurora-text-secondary font-extrabold rounded-xl shadow-lg cursor-pointer transition-all">
              Close Window
            </button>
          </div>
          
          <div class="cert-container relative w-[1000px] h-[700px] bg-amber-50/20 border-[20px] border-double border-amber-600 p-16 text-center flex flex-col justify-between shadow-2xl rounded bg-white relative overflow-hidden">
            
            <!-- Elegant Corner Borders -->
            <div class="absolute top-6 left-6 w-16 h-16 border-t-4 border-l-4 border-amber-600"></div>
            <div class="absolute top-6 right-6 w-16 h-16 border-t-4 border-r-4 border-amber-600"></div>
            <div class="absolute bottom-6 left-6 w-16 h-16 border-b-4 border-l-4 border-amber-600"></div>
            <div class="absolute bottom-6 right-6 w-16 h-16 border-b-4 border-r-4 border-amber-600"></div>

            <!-- Header -->
            <div class="space-y-1">
              <div class="flex items-center justify-center gap-2">
                <span class="text-violet-600 text-lg font-black tracking-widest">EXAMNOVA</span>
                <span class="text-zinc-400 text-xs font-bold uppercase tracking-wider">Placement Suite</span>
              </div>
              <div class="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto"></div>
            </div>

            <!-- Certificate Title -->
            <div class="space-y-2">
              <h1 class="title-font text-4xl font-extrabold tracking-widest text-zinc-900 uppercase">Certificate of Completion</h1>
              <p class="text-xs font-semibold text-zinc-500 tracking-widest uppercase">This is proudly presented to</p>
            </div>

            <!-- Recipient Name -->
            <div class="my-4">
              <h2 class="title-font text-4xl font-extrabold text-violet-900 border-b-2 border-zinc-200 inline-block px-12 pb-1.5">
                ${studentName}
              </h2>
            </div>

            <!-- Body Text -->
            <div class="max-w-2xl mx-auto space-y-3">
              <p class="text-sm text-zinc-600 leading-relaxed">
                for demonstrating exceptional preparedness and successfully clearing all evaluation rounds of the 
                <strong class="text-zinc-900 font-extrabold">${cert.company} Mock Placement Simulation</strong>.
              </p>
              <p class="text-xs text-zinc-500">
                Performance achieved: Aptitude, Coding, and AI-driven Technical & HR rounds with an overall score of 
                <strong class="text-violet-700 font-extrabold text-sm">${cert.score}%</strong>.
              </p>
            </div>

            <!-- Footer -->
            <div class="grid grid-cols-3 items-end pt-6 border-t border-zinc-150 mt-4">
              <!-- Issue Date -->
              <div class="text-left space-y-1 pl-4">
                <span class="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Date of Issue</span>
                <span class="text-xs text-zinc-800 font-extrabold">${dateStr}</span>
                <span class="text-[8px] text-zinc-400 font-mono block mt-1">Verification ID: ${credentialId}</span>
              </div>

              <!-- Center Emblem -->
              <div class="flex justify-center">
                <div class="relative w-24 h-24 rounded-full border-4 border-double border-amber-600 flex items-center justify-center bg-amber-50">
                  <div class="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    ★
                  </div>
                  <div class="absolute -bottom-1.5 px-2.5 py-0.5 rounded bg-zinc-900 text-[8px] text-amber-400 font-black tracking-widest uppercase">VERIFIED</div>
                </div>
              </div>

              <!-- Signatures -->
              <div class="text-right pr-4 space-y-1">
                <div class="h-10 flex items-end justify-end">
                  <span class="sig-font text-3xl text-violet-700 italic pr-2">ExamNova AI Panel</span>
                </div>
                <div class="w-40 h-px bg-zinc-300 ml-auto"></div>
                <span class="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Authorized Evaluator</span>
              </div>
            </div>

          </div>
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        <p className="text-xs text-zinc-400">Loading your certificates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">Certificates</h2>
        <p className="text-xs text-zinc-500">Your earned Mock Placement completion certificates.</p>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-bold">No certificates yet</p>
          <p className="text-xs mt-1">Get Selected in a placement drive to earn a certificate.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {history.map((h, idx) => {
            const isOpen = selectedCert === h.id;
            const ResultIcon = getResultIcon(h.result);
            return (
              <motion.div
                key={h.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              >
                {isOpen ? (
                  <Card className="border-4 border-double border-amber-500 bg-amber-50/5 dark:bg-zinc-950 p-6 shadow-xl space-y-6 text-center relative overflow-hidden">
                    <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-500/50"></div>
                    <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-500/50"></div>
                    <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-500/50"></div>
                    <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-500/50"></div>

                    <div className="space-y-1 pt-2">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-violet-600 text-xs font-black tracking-widest">EXAMNOVA</span>
                        <span className="text-zinc-500 text-[8px] font-bold uppercase tracking-wider">Placement Suite</span>
                      </div>
                      <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto"></div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-bold tracking-wide text-zinc-900 dark:text-amber-500 uppercase">Certificate of Excellence</h3>
                      <p className="text-[10px] text-zinc-500 italic">This is proudly presented to</p>
                      <p className="text-md font-extrabold text-violet-600 dark:text-violet-400 underline decoration-amber-500/30 underline-offset-4 decoration-1">
                        {user?.email ? user.email.split("@")[0].toUpperCase() : "EXAMNOVA STUDENT"}
                      </p>
                    </div>

                    <div className="text-[10px] text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
                      for outstanding performance and successful completion of the <strong className="text-zinc-800 dark:text-zinc-200">{h.company} Mock Placement Simulation</strong> with a final score of <strong className="text-violet-600 dark:text-violet-400 font-extrabold">{h.score}%</strong>.
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 pt-4 text-[9px] text-zinc-400">
                      <div>
                        <span className="block font-bold">DATE OF ISSUE</span>
                        <span className="text-zinc-800 dark:text-zinc-200">{new Date(h.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                      </div>
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-amber-500 bg-amber-500/10 text-amber-500 text-xs font-black shadow-inner">
                        ★
                      </div>
                      <div className="text-right">
                        <span className="block font-bold">VERIFICATION ID</span>
                        <span className="font-mono text-zinc-800 dark:text-zinc-200">EN-MP-{h.id.substring(0, 6).toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button onClick={() => setSelectedCert(null)}
                        className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer transition-all"
                      >Close</button>
                      <button onClick={() => handleDownloadPDF(h)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer transition-all"
                      ><Download className="w-3.5 h-3.5" /> Download / Print PDF</button>
                    </div>
                  </Card>
                ) : (
                  <button onClick={() => setSelectedCert(h.id)}
                    className="w-full p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-955 hover:border-violet-300 dark:hover:border-violet-700 transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-black ${COMPANY_LOGOS[h.company] || "bg-zinc-500"} group-hover:scale-105 transition-transform`}>
                        {h.company[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-zinc-900 dark:text-white">{h.company} Certificate</span>
                          <ResultIcon className={`w-4 h-4 ${getResultColor(h.result)}`} />
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-zinc-500">
                          <span>Placement Drive</span>
                          <span>{h.date}</span>
                          <span>{h.score}% score</span>
                        </div>
                      </div>
                      <Award className="w-5 h-5 text-zinc-300 dark:text-zinc-700 group-hover:text-violet-500 transition-colors" />
                    </div>
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
