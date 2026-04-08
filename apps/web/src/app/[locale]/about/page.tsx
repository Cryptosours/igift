import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, Mail, BookOpen } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "About",
  description: "iGift is a deal intelligence platform for digital gift cards, credits, and vouchers. Learn about our mission and methodology.",
};

export default async function AboutPage() {
  const t = await getTranslations("AboutPage");

  const weAre = [
    t("weAre1"),
    t("weAre2"),
    t("weAre3"),
    t("weAre4"),
    t("weAre5"),
  ];

  const weAreNot = [
    t("weAreNot1"),
    t("weAreNot2"),
    t("weAreNot3"),
    t("weAreNot4"),
    t("weAreNot5"),
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <FadeIn>
        <span className="data-label text-brand-600">{t("label")}</span>
        <h1 className="mt-1 heading-display text-3xl text-surface-900">
          {t("heading")}
        </h1>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-surface-600">
          <p>{t("introParagraph1")}</p>
          <p>
            {t.rich("introParagraph2", {
              dealQuality: (chunks) => <strong className="text-surface-800">{chunks}</strong>,
              confidence: (chunks) => <strong className="text-surface-800">{chunks}</strong>,
            })}
          </p>
        </div>
      </FadeIn>

      {/* What We Are / What We're Not */}
      <StaggerContainer className="mt-10 grid gap-4 sm:grid-cols-2" stagger={0.06}>
        <StaggerItem>
          <div className="rounded-2xl border border-deal-200 bg-deal-50/50 p-6 h-full">
            <h2 className="text-base font-bold text-deal-800">{t("whatWeAre")}</h2>
            <ul className="mt-4 space-y-3">
              {weAre.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-deal-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-deal-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 h-full">
            <h2 className="text-base font-bold text-red-800">{t("whatWeAreNot")}</h2>
            <ul className="mt-4 space-y-3">
              {weAreNot.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-red-700">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Contact */}
      <FadeIn delay={0.15}>
        <div id="contact" className="mt-12 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100">
              <Mail className="h-6 w-6 text-brand-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-surface-900">{t("contactHeading")}</h2>
              <p className="mt-1 text-sm text-surface-500">
                {t("contactBody")}{" "}
                <span className="font-semibold text-brand-600">hello@igift.app</span>.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-surface-400" />
                <Link
                  href="/methodology"
                  className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
                >
                  {t("readMethodology")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
