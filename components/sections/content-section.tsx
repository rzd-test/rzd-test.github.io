"use client"

import { LecturesSection } from "./lectures-section"
import { TrainingSection } from "./training-section"
import { EventsSection } from "./events-section"
import { ExamsSection } from "./exams-section"
import { InterviewsSection } from "./interviews-section"
import { ReportsSection } from "./reports-section"
import { OrdersSection } from "./orders-section"
import { ReportCompilerSection } from "./report-compilers-section"
import { ContentsSection } from "./contents-section"
import { AdminSection } from "./admin-section"
import { GovWaveSection } from "./gov-wave-section"
import { InformationSection } from "./information-section"
import { DutySection } from "./duty-section"
import { RadioReportsSection } from "./radio-reports-section"
import { ReportGenerationSection } from "./report-generation-section"
import { RetroTrainSection } from "./retro-train-section"
import { RZDWebsiteSection } from "./rzd-website-section"
import type { UserRole } from "@/data/users"

interface ContentSectionProps {
  activeSection: string
  userRole?: UserRole
  userNickname?: string // Add userNickname prop
}

export function ContentSection({ activeSection, userRole, userNickname }: ContentSectionProps) {
  switch (activeSection) {
    case "information":
      return <InformationSection userRole={userRole} />
    case "duty":
      return <DutySection />
    case "reports-section":
      return <RadioReportsSection userRole={userRole} />
    case "contents":
      return <ContentsSection onSectionChange={() => {}} userRole={userRole || "Стажёр"} />
    case "lectures":
      return <LecturesSection />
    case "training":
      return <TrainingSection />
    case "events":
      return <EventsSection />
    case "exams":
      return <ExamsSection />
    case "interviews":
      return <InterviewsSection />
    case "retro-train":
      return <RetroTrainSection />
    case "reports":
      return <ReportsSection />
    case "orders":
      return <OrdersSection />
    case "gov-wave":
      return <GovWaveSection />
    case "report-compiler":
      return <ReportCompilerSection />
    case "admin":
      return <AdminSection />
    case "report-generation":
      return <ReportGenerationSection />
    case "rzd-website":
      return <RZDWebsiteSection userRole={userRole || "Стажёр"} userNickname={userNickname} />
    default:
      return <InformationSection userRole={userRole} />
  }
}
