import { prisma } from "@/lib/db";
import { PortalOverride, getExamWindowInfo, ExamWindowInfo } from "./exam-window";

export async function getEffectiveExamWindow(): Promise<ExamWindowInfo & { override: PortalOverride }> {
  let override: PortalOverride = "SCHEDULED";
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "PORTAL_OVERRIDE" },
    });
    if (
      setting &&
      (setting.value === "FORCE_OPEN" ||
        setting.value === "FORCE_CLOSED" ||
        setting.value === "SCHEDULED")
    ) {
      override = setting.value as PortalOverride;
    }
  } catch (e) {
    console.error("Failed to read system setting", e);
  }

  const info = getExamWindowInfo(new Date(), override);
  return { ...info, override };
}

export async function setPortalOverride(override: PortalOverride): Promise<void> {
  await prisma.systemSetting.upsert({
    where: { key: "PORTAL_OVERRIDE" },
    create: {
      key: "PORTAL_OVERRIDE",
      value: override,
    },
    update: {
      value: override,
    },
  });
}
