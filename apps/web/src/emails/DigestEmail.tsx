/**
 * Weekly Deal Digest Email Template
 *
 * Rendered server-side via @react-email/render.
 * Sent once a week to newsletter subscribers with the top deals.
 */

import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components";

export interface DigestDeal {
  id: number;
  brandName: string;
  title: string;
  faceValue: string;
  effectivePrice: string;
  discountPct: string;
  sourceName: string;
  trustZone: "green" | "yellow" | "red";
  dealUrl: string;
}

export interface DigestEmailProps {
  weekLabel: string;
  deals: DigestDeal[];
  siteUrl: string;
  unsubscribeUrl: string;
  dealsUrl: string;
}

const trustColors = { green: "#22c55e", yellow: "#eab308", red: "#ef4444" };
const trustLabels = { green: "✓ Verified", yellow: "⚡ Marketplace", red: "⚠ Caution" };

export function DigestEmail({
  weekLabel,
  deals,
  siteUrl,
  unsubscribeUrl,
  dealsUrl,
}: DigestEmailProps) {
  const topDeals = deals.slice(0, 5);

  return (
    <Html lang="en">
      <Head />
      <Preview>
        This week&apos;s top gift card deals — up to{" "}
        {topDeals[0]?.discountPct ?? "0"}% off · iGift Weekly
      </Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>
              <Link href={siteUrl} style={logoLink}>
                iGift
              </Link>
            </Heading>
            <Text style={weekBadge}>{weekLabel} Weekly Digest</Text>
          </Section>

          {/* Intro */}
          <Section style={introSection}>
            <Text style={introText}>
              Here are this week&apos;s top gift card deals, ranked by real discount. All prices are
              verified — we only show deals where you actually save.
            </Text>
          </Section>

          {/* Deal list */}
          {topDeals.map((deal, idx) => (
            <Section key={deal.id} style={dealCard}>
              <Row>
                <Column style={rankCol}>
                  <Text style={rankNumber}>#{idx + 1}</Text>
                </Column>
                <Column style={dealContentCol}>
                  <Row>
                    <Column>
                      <Text style={dealBrand}>{deal.brandName}</Text>
                      <Text style={dealTitleText}>{deal.title}</Text>
                    </Column>
                    <Column style={discountCol}>
                      <Text style={discountBadge}>{deal.discountPct}% off</Text>
                    </Column>
                  </Row>
                  <Row style={priceRow}>
                    <Column>
                      <Text style={dealMeta}>
                        <span style={{ color: "#94a3b8" }}>Was:</span>{" "}
                        <span style={{ textDecoration: "line-through", color: "#94a3b8" }}>
                          {deal.faceValue}
                        </span>
                        {"  "}
                        <span style={{ color: "#059669", fontWeight: "700" }}>
                          Now: {deal.effectivePrice}
                        </span>
                        {"  "}
                        <span
                          style={{
                            color: trustColors[deal.trustZone],
                            fontSize: 11,
                          }}
                        >
                          {trustLabels[deal.trustZone]} · {deal.sourceName}
                        </span>
                      </Text>
                    </Column>
                    <Column style={viewLinkCol}>
                      <Link href={deal.dealUrl} style={viewLink}>
                        View →
                      </Link>
                    </Column>
                  </Row>
                </Column>
              </Row>
            </Section>
          ))}

          {/* CTA */}
          <Section style={ctaSection}>
            <Button href={dealsUrl} style={ctaButton}>
              See All Deals on iGift
            </Button>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              You&apos;re receiving this weekly digest because you subscribed on{" "}
              <Link href={siteUrl} style={footerLink}>
                iGift
              </Link>
              .
            </Text>
            <Text style={footerText}>
              <Link href={`${siteUrl}/alerts`} style={footerLink}>
                Manage preferences
              </Link>{" "}
              ·{" "}
              <Link href={unsubscribeUrl} style={footerLink}>
                Unsubscribe
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  fontFamily:
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif",
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  maxWidth: 580,
  margin: "0 auto",
  padding: "32px 16px",
};

const header: React.CSSProperties = {
  textAlign: "center",
  marginBottom: 8,
};

const logo: React.CSSProperties = {
  margin: 0,
  fontSize: 26,
  fontWeight: "800",
  color: "#c15f3c",
};

const logoLink: React.CSSProperties = {
  color: "#c15f3c",
  textDecoration: "none",
};

const weekBadge: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: 12,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const introSection: React.CSSProperties = {
  marginBottom: 20,
};

const introText: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: "#475569",
  lineHeight: "1.6",
  textAlign: "center",
};

const dealCard: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  padding: "16px 20px",
  marginBottom: 10,
};

const rankCol: React.CSSProperties = {
  width: 32,
  verticalAlign: "middle",
};

const rankNumber: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: "800",
  color: "#c15f3c",
};

const dealContentCol: React.CSSProperties = {
  verticalAlign: "middle",
};

const dealBrand: React.CSSProperties = {
  margin: "0 0 2px",
  fontSize: 15,
  fontWeight: "700",
  color: "#0f172a",
};

const dealTitleText: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: 12,
  color: "#64748b",
};

const discountCol: React.CSSProperties = {
  width: 80,
  textAlign: "right",
  verticalAlign: "top",
};

const discountBadge: React.CSSProperties = {
  margin: 0,
  display: "inline-block",
  backgroundColor: "#dcfce7",
  color: "#15803d",
  fontSize: 13,
  fontWeight: "700",
  padding: "3px 8px",
  borderRadius: 20,
};

const priceRow: React.CSSProperties = {
  marginTop: 4,
};

const dealMeta: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  color: "#475569",
};

const viewLinkCol: React.CSSProperties = {
  width: 60,
  textAlign: "right",
};

const viewLink: React.CSSProperties = {
  fontSize: 13,
  fontWeight: "600",
  color: "#c15f3c",
  textDecoration: "none",
};

const ctaSection: React.CSSProperties = {
  textAlign: "center",
  marginTop: 24,
  marginBottom: 8,
};

const ctaButton: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#c15f3c",
  color: "#ffffff",
  padding: "12px 32px",
  borderRadius: 8,
  fontWeight: "600",
  fontSize: 14,
  textDecoration: "none",
};

const divider: React.CSSProperties = {
  borderColor: "#e2e8f0",
  margin: "24px 0",
};

const footerSection: React.CSSProperties = {
  textAlign: "center",
};

const footerText: React.CSSProperties = {
  margin: "0 0 4px",
  fontSize: 11,
  color: "#94a3b8",
  lineHeight: "1.6",
};

const footerLink: React.CSSProperties = {
  color: "#d97757",
  textDecoration: "none",
};
