/**
 * Price Alert Email Template
 *
 * Rendered server-side via @react-email/render — never bundled into the client.
 * Used by lib/alerts/email.ts when a tracked brand/discount threshold is met.
 */

import * as React from "react";
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

export interface AlertEmailProps {
  brandName: string;
  title: string;
  faceValue: string;
  effectivePrice: string;
  discountPct: string;
  sourceName: string;
  trustZone: "green" | "yellow" | "red";
  dealUrl: string;
  manageUrl: string;
  unsubscribeUrl: string;
  siteUrl: string;
}

const trustColors = {
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444",
};

const trustLabels = {
  green: "Verified Source",
  yellow: "Marketplace",
  red: "Caution",
};

export function AlertEmail({
  brandName,
  title,
  faceValue,
  effectivePrice,
  discountPct,
  sourceName,
  trustZone,
  dealUrl,
  manageUrl,
  unsubscribeUrl,
  siteUrl,
}: AlertEmailProps) {
  const trustColor = trustColors[trustZone];
  const trustLabel = trustLabels[trustZone];

  return (
    <Html lang="en">
      <Head />
      <Preview>
        {brandName} — {discountPct}% off right now on iGift
      </Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Heading style={headerHeading}>
              <Link href={siteUrl} style={logoLink}>
                iGift
              </Link>
            </Heading>
            <Text style={headerSubtitle}>Deal Alert</Text>
          </Section>

          {/* Deal Card */}
          <Section style={card}>
            {/* Trust badge */}
            <Row style={badgeRow}>
              <Column>
                <Text style={badge}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: trustColor,
                      marginRight: 6,
                    }}
                  />
                  {trustLabel} · {sourceName}
                </Text>
              </Column>
            </Row>

            <Heading style={brandHeading}>{brandName}</Heading>
            <Text style={dealTitle}>{title}</Text>

            {/* Price row */}
            <Row style={priceRow}>
              <Column style={priceCol}>
                <Text style={priceLabel}>Face Value</Text>
                <Text style={priceValue}>{faceValue}</Text>
              </Column>
              <Column style={priceCol}>
                <Text style={priceLabel}>Your Price</Text>
                <Text style={{ ...priceValue, color: "#059669" }}>{effectivePrice}</Text>
              </Column>
              <Column style={priceCol}>
                <Text style={priceLabel}>Discount</Text>
                <Text style={{ ...priceValue, color: "#059669", fontWeight: "700" }}>
                  {discountPct}% off
                </Text>
              </Column>
            </Row>

            <Button href={dealUrl} style={ctaButton}>
              View Deal →
            </Button>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              You&apos;re receiving this because you set a price alert on{" "}
              <Link href={siteUrl} style={footerLink}>
                iGift
              </Link>
              .
            </Text>
            <Text style={footerText}>
              <Link href={manageUrl} style={footerLink}>
                Manage alerts
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

// ── Styles ──────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  fontFamily:
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif",
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  maxWidth: 560,
  margin: "0 auto",
  padding: "32px 16px",
};

const headerSection: React.CSSProperties = {
  textAlign: "center",
  marginBottom: 24,
};

const headerHeading: React.CSSProperties = {
  margin: 0,
  fontSize: 24,
  fontWeight: "700",
  color: "#c15f3c",
};

const logoLink: React.CSSProperties = {
  color: "#c15f3c",
  textDecoration: "none",
};

const headerSubtitle: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: 13,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const card: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  padding: 24,
  marginBottom: 24,
};

const badgeRow: React.CSSProperties = {
  marginBottom: 12,
};

const badge: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const brandHeading: React.CSSProperties = {
  margin: "0 0 4px",
  fontSize: 20,
  fontWeight: "700",
  color: "#0f172a",
};

const dealTitle: React.CSSProperties = {
  margin: "0 0 20px",
  fontSize: 14,
  color: "#475569",
  lineHeight: "1.5",
};

const priceRow: React.CSSProperties = {
  marginBottom: 20,
};

const priceCol: React.CSSProperties = {
  width: "33%",
};

const priceLabel: React.CSSProperties = {
  margin: "0 0 2px",
  fontSize: 11,
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const priceValue: React.CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: "600",
  color: "#334155",
};

const ctaButton: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "center",
  backgroundColor: "#c15f3c",
  color: "#ffffff",
  padding: "12px 0",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: "600",
  fontSize: 14,
};

const divider: React.CSSProperties = {
  borderColor: "#e2e8f0",
  margin: "0 0 24px",
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
