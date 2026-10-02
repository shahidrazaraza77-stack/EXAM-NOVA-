"use client";

import React from "react";
import ReadinessRing from "../components/ReadinessRing";
import ProgressCharts from "../components/ProgressCharts";
import SectionalAnalytics from "../components/SectionalAnalytics";

interface ReadinessViewProps {
  scores: {
    overall: number;
    resumeScore: number;
    aptitudeScore: number;
    codingScore: number;
    interviewScore: number;
  };
  skillGaps?: any;
}

export default function ReadinessView({ scores, skillGaps }: ReadinessViewProps) {
  const { overall, resumeScore, aptitudeScore, codingScore, interviewScore } = scores;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <ReadinessRing score={overall} />
        </div>
        <div className="lg:col-span-8">
          <ProgressCharts
            overall={overall}
            aptitude={aptitudeScore}
            coding={codingScore}
            interview={interviewScore}
            skillGaps={skillGaps}
          />
        </div>
      </div>
      <SectionalAnalytics
        resumeScore={resumeScore}
        aptitudeScore={aptitudeScore}
        codingScore={codingScore}
        interviewScore={interviewScore}
        skillGaps={skillGaps}
      />
    </div>
  );
}
