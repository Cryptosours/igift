import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "iGift terms of service. We are a deal discovery and verification platform — not a marketplace or payment processor.",
};

export default async function TermsPage() {
  const t = await getTranslations("TermsPage");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-surface-900">{t("heading")}</h1>
      <p className="mt-2 text-sm text-surface-500">
        {t("lastUpdated")}
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-surface-600">
        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            {t("section1Heading")}
          </h2>
          <p className="mt-2">
            {t.rich("section1Body", {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            {t("section2Heading")}
          </h2>
          <p className="mt-2">
            {t.rich("section2Body", {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            {t("section3Heading")}
          </h2>
          <p className="mt-2">
            {t("section3Body")}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            {t("section4Heading")}
          </h2>
          <p className="mt-2">
            {t("section4Body")}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            {t("section5Heading")}
          </h2>
          <p className="mt-2">
            {t("section5Body")}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            {t("section6Heading")}
          </h2>
          <p className="mt-2">
            {t("section6Body")}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            {t("section7Heading")}
          </h2>
          <p className="mt-2">{t("section7Body")}</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>{t("section7Item1")}</li>
            <li>{t("section7Item2")}</li>
            <li>{t("section7Item3")}</li>
            <li>{t("section7Item4")}</li>
            <li>{t("section7Item5")}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            {t("section8Heading")}
          </h2>
          <p className="mt-2">
            {t("section8Body")}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            {t("section9Heading")}
          </h2>
          <p className="mt-2">
            {t("section9Body")}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            {t("section10Heading")}
          </h2>
          <p className="mt-2">
            {t("section10Body")}{" "}
            <span className="font-medium text-brand-600">
              {t("contactEmail")}
            </span>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
