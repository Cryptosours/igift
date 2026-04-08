import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description:
    "How iGift earns revenue through affiliate partnerships and how this does (and does not) affect our deal rankings.",
};

export default async function DisclosurePage() {
  const t = await getTranslations("DisclosurePage");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-surface-900">
        {t("heading")}
      </h1>
      <p className="mt-2 text-sm text-surface-500">
        {t("lastUpdated")}
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-surface-600">
        <section className="rounded-lg border border-brand-200 bg-brand-50 p-6">
          <h2 className="text-base font-semibold text-brand-900">
            {t("shortVersionHeading")}
          </h2>
          <p className="mt-2 text-brand-800">
            {t("shortVersionBody")}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            {t("revenueHeading")}
          </h2>
          <p className="mt-2">
            {t("revenueIntro")}
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              <strong>{t("revenueItem1Label")}</strong> — {t("revenueItem1Text")}
            </li>
            <li>
              <strong>{t("revenueItem2Label")}</strong>{" "}
              {t("revenueItem2Text")}
            </li>
            <li>
              <strong>{t("revenueItem3Label")}</strong>{" "}
              {t("revenueItem3Text")}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            {t("notAffectHeading")}
          </h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              <strong>{t("notAffectItem1Label")}</strong>{" "}
              {t("notAffectItem1Text")}
            </li>
            <li>
              <strong>{t("notAffectItem2Label")}</strong>{" "}
              {t("notAffectItem2Text")}
            </li>
            <li>
              <strong>{t("notAffectItem3Label")}</strong>{" "}
              {t("notAffectItem3Text")}
            </li>
            <li>
              <strong>{t("notAffectItem4Label")}</strong>{" "}
              {t("notAffectItem4Text")}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            {t("identifyHeading")}
          </h2>
          <p className="mt-2">
            {t.rich("identifyBody", {
              icon: () => <ExternalLink className="inline h-3 w-3" />,
            })}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            {t("commitmentHeading")}
          </h2>
          <p className="mt-2">
            {t("commitmentBody")}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            {t("questionsHeading")}
          </h2>
          <p className="mt-2">
            {t.rich("questionsBody", {
              email: (chunks) => (
                <span className="font-medium text-brand-600">{chunks}</span>
              ),
            })}
          </p>
        </section>
      </div>
    </div>
  );
}
