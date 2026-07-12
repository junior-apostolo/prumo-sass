// @ts-nocheck
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { OrcamentoRapidoPayload, OrcamentoRapidoItem } from "@enge-pro/shared";

const BLUE = "#1e3a5f";
const BLUE_LIGHT = "#e8f0fe";
const GRAY = "#6b7280";
const GRAY_LIGHT = "#f3f4f6";
const BLACK = "#111827";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: BLACK,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: BLUE,
  },
  logo: { width: 80, height: 40, objectFit: "contain" },
  workspaceName: { fontSize: 18, fontFamily: "Helvetica-Bold", color: BLUE },
  workspaceSub: { fontSize: 7.5, color: GRAY, marginTop: 2 },
  docInfo: { alignItems: "flex-end" },
  docTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", color: BLUE },
  docSub: { fontSize: 8, color: GRAY, marginTop: 2 },
  clienteBox: {
    backgroundColor: GRAY_LIGHT,
    borderRadius: 4,
    padding: 10,
    marginBottom: 16,
  },
  clienteLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  clienteName: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: BLACK, marginBottom: 2 },
  clienteDetail: { fontSize: 8, color: GRAY },
  tableContainer: { marginBottom: 4 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: BLUE,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderText: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  tableRowAlt: { backgroundColor: GRAY_LIGHT },
  tableCell: { fontSize: 8.5, color: BLACK },
  colDesc: { flex: 5 },
  colUnit: { flex: 1.2, textAlign: "center" },
  colQty: { flex: 1, textAlign: "right" },
  colPrice: { flex: 1.8, textAlign: "right" },
  colTotal: { flex: 1.8, textAlign: "right" },
  totalRow: {
    flexDirection: "row",
    backgroundColor: BLUE,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginTop: 2,
    marginBottom: 14,
  },
  totalLabel: {
    flex: 9,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textAlign: "right",
    paddingRight: 8,
  },
  totalValue: { flex: 2, fontSize: 10, fontFamily: "Helvetica-Bold", color: "#ffffff", textAlign: "right" },
  conditionsRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  conditionBox: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: "#d1d5db",
    borderRadius: 4,
    padding: 8,
  },
  conditionLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  conditionValue: { fontSize: 8.5, color: BLACK },
  obsBox: {
    borderWidth: 0.5,
    borderColor: "#d1d5db",
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  obsLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  obsText: { fontSize: 8.5, color: BLACK, lineHeight: 1.5 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BLUE,
    paddingVertical: 10,
    paddingHorizontal: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  footerCenter: { fontSize: 6.5, color: BLUE_LIGHT },
  footerRight: { fontSize: 7.5, color: BLUE_LIGHT },
});

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function padNumber(n: number): string {
  return String(n).padStart(4, "0");
}

function generateOrcNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const seq = padNumber(Math.floor(Math.random() * 9000) + 1000);
  return `ORC-${year}-${seq}`;
}

const styles_verba = StyleSheet.create({
  verbaTotalBox: {
    backgroundColor: GRAY_LIGHT,
    borderRadius: 4,
    padding: 12,
    marginBottom: 14,
  },
  verbaTotalLabel: { fontSize: 8, color: GRAY, marginBottom: 4 },
  verbaTotalDesc: { fontSize: 8.5, color: BLACK, marginTop: 4, lineHeight: 1.4 },
  verbaTotalValue: { fontSize: 18, fontFamily: "Helvetica-Bold", color: BLUE },
});

export interface OrcamentoRapidoPdfInput {
  payload: OrcamentoRapidoPayload;
  workspace: {
    name: string;
    razaoSocial: string | null;
    logoUrl: string | null;
    cnpj: string | null;
    telefone: string | null;
    emailContato: string | null;
  };
}

interface Props {
  input: OrcamentoRapidoPdfInput;
}

export function OrcamentoRapidoPdf({ input }: Props) {
  const { payload, workspace } = input;
  const nomeEmpresa = workspace.razaoSocial || workspace.name;
  const { modoServico, cliente, itens = [], verba, pagamento, validadeDias, observacoes } = payload;

  const hoje = new Date();
  const validade = new Date(hoje);
  validade.setDate(validade.getDate() + validadeDias);
  const orcNumber = generateOrcNumber();

  const totalGeral =
    modoServico === "verba"
      ? (verba?.valorTotal ?? 0)
      : itens.reduce((acc, item) => acc + item.quantidade * item.valorUnitario, 0);

  const footerContatos = [workspace.telefone, workspace.emailContato]
    .filter(Boolean)
    .join(" · ");

  return (
    <Document
      title={`Orçamento ${orcNumber} — ${nomeEmpresa}`}
      author={nomeEmpresa}
      creator="PRUMO"
    >
      <Page size="A4" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            {workspace.logoUrl ? (
              <Image src={workspace.logoUrl} style={styles.logo} />
            ) : (
              <Text style={styles.workspaceName}>{nomeEmpresa}</Text>
            )}
            {workspace.cnpj && (
              <Text style={styles.workspaceSub}>CNPJ: {workspace.cnpj}</Text>
            )}
          </View>
          <View style={styles.docInfo}>
            <Text style={styles.docTitle}>ORÇAMENTO</Text>
            <Text style={styles.docSub}>{orcNumber}</Text>
            <Text style={styles.docSub}>Emitido em: {formatDate(hoje)}</Text>
            <Text style={styles.docSub}>Válido até: {formatDate(validade)}</Text>
          </View>
        </View>

        {/* ── Cliente ── */}
        <View style={styles.clienteBox}>
          <Text style={styles.clienteLabel}>Cliente / Destinatário</Text>
          <Text style={styles.clienteName}>{cliente.nome}</Text>
          {cliente.endereco && (
            <Text style={styles.clienteDetail}>{cliente.endereco}</Text>
          )}
        </View>

        {/* ── Itens ou Verba ── */}
        {modoServico === "wizard" ? (
          <>
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.colDesc]}>Descrição do serviço</Text>
                <Text style={[styles.tableHeaderText, styles.colUnit]}>Unid.</Text>
                <Text style={[styles.tableHeaderText, styles.colQty]}>Qtd</Text>
                <Text style={[styles.tableHeaderText, styles.colPrice]}>Vlr Unit.</Text>
                <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
              </View>
              {itens.map((item: OrcamentoRapidoItem, i: number) => (
                <View
                  key={i}
                  style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
                >
                  <Text style={[styles.tableCell, styles.colDesc]}>{item.descricao}</Text>
                  <Text style={[styles.tableCell, styles.colUnit]}>{item.unidade}</Text>
                  <Text style={[styles.tableCell, styles.colQty]}>
                    {item.quantidade % 1 === 0 ? item.quantidade : item.quantidade.toFixed(2)}
                  </Text>
                  <Text style={[styles.tableCell, styles.colPrice]}>
                    {formatBRL(item.valorUnitario)}
                  </Text>
                  <Text style={[styles.tableCell, styles.colTotal]}>
                    {formatBRL(item.quantidade * item.valorUnitario)}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL GERAL</Text>
              <Text style={styles.totalValue}>{formatBRL(totalGeral)}</Text>
            </View>
          </>
        ) : (
          <View style={styles_verba.verbaTotalBox}>
            <Text style={styles_verba.verbaTotalLabel}>Serviço / Descrição</Text>
            <Text style={styles_verba.verbaTotalDesc}>
              {verba?.descricao ?? "Serviço conforme acordado"}
            </Text>
            <Text style={[styles_verba.verbaTotalLabel, { marginTop: 10 }]}>
              Valor total (preço fechado)
            </Text>
            <Text style={styles_verba.verbaTotalValue}>{formatBRL(totalGeral)}</Text>
          </View>
        )}

        {/* ── Condições ── */}
        <View style={styles.conditionsRow}>
          {pagamento && (
            <View style={styles.conditionBox}>
              <Text style={styles.conditionLabel}>Condições de pagamento</Text>
              <Text style={styles.conditionValue}>{pagamento}</Text>
            </View>
          )}
          <View style={styles.conditionBox}>
            <Text style={styles.conditionLabel}>Validade do orçamento</Text>
            <Text style={styles.conditionValue}>
              {validadeDias} dias (até {formatDate(validade)})
            </Text>
          </View>
        </View>

        {/* ── Observações ── */}
        {observacoes && (
          <View style={styles.obsBox}>
            <Text style={styles.obsLabel}>Observações</Text>
            <Text style={styles.obsText}>{observacoes}</Text>
          </View>
        )}

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>{nomeEmpresa}</Text>
          <Text style={styles.footerCenter}>Gerado com PRUMO</Text>
          {footerContatos ? (
            <Text style={styles.footerRight}>{footerContatos}</Text>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}

export async function renderOrcamentoRapidoToBuffer(
  input: OrcamentoRapidoPdfInput,
): Promise<Buffer> {
  const element = OrcamentoRapidoPdf({ input });
  return renderToBuffer(element);
}
