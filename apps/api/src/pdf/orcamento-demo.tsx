// @ts-nocheck
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { DemoWizardPayload, DemoItemServico } from "@enge-pro/shared";
import { formatCpfCnpj, formatTelefone } from "@enge-pro/shared";

const BLUE = "#1e3a5f";
const BLUE_LIGHT = "#e8f0fe";
const ORANGE = "#ea580c";
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
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: BLUE,
  },
  brandName: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    letterSpacing: 1.5,
  },
  brandTagline: {
    fontSize: 7.5,
    color: GRAY,
    marginTop: 2,
  },
  docInfo: {
    alignItems: "flex-end",
  },
  docTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
  },
  docNumber: {
    fontSize: 8,
    color: GRAY,
    marginTop: 2,
  },
  docDate: {
    fontSize: 8,
    color: GRAY,
    marginTop: 1,
  },
  // Parties
  parties: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  partyBox: {
    flex: 1,
    backgroundColor: GRAY_LIGHT,
    borderRadius: 4,
    padding: 10,
  },
  partyLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  partyName: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: BLACK,
    marginBottom: 3,
  },
  partyDetail: {
    fontSize: 8,
    color: GRAY,
    marginBottom: 1,
  },
  // Table
  tableContainer: {
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: BLUE,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  tableRowAlt: {
    backgroundColor: GRAY_LIGHT,
  },
  tableCell: {
    fontSize: 8.5,
    color: BLACK,
  },
  colDesc: { flex: 5 },
  colUnit: { flex: 1.2, textAlign: "center" },
  colQty: { flex: 1, textAlign: "right" },
  colPrice: { flex: 1.8, textAlign: "right" },
  colTotal: { flex: 1.8, textAlign: "right" },
  // Total row
  totalRow: {
    flexDirection: "row",
    backgroundColor: BLUE,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginTop: 2,
  },
  totalLabel: {
    flex: 9,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textAlign: "right",
    paddingRight: 8,
  },
  totalValue: {
    flex: 2,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textAlign: "right",
  },
  // Conditions
  conditionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
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
  conditionValue: {
    fontSize: 8.5,
    color: BLACK,
  },
  // Observations
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
  obsText: {
    fontSize: 8.5,
    color: BLACK,
    lineHeight: 1.5,
  },
  // Watermark footer
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
  footerLeft: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  footerRight: {
    fontSize: 7.5,
    color: BLUE_LIGHT,
  },
  // Verba mode
  verbaTotalBox: {
    backgroundColor: GRAY_LIGHT,
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
  },
  verbaTotalLabel: {
    fontSize: 8,
    color: GRAY,
    marginBottom: 4,
  },
  verbaTotalValue: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
  },
  verbaTotalDesc: {
    fontSize: 8.5,
    color: BLACK,
    marginTop: 4,
    lineHeight: 1.4,
  },
});

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
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

const OFICIO_LABELS: Record<string, string> = {
  PINTURA: "Pintura",
  ELETRICA: "Elétrica",
  REVESTIMENTO: "Piso / Revestimento",
  HIDRAULICA: "Hidráulica",
  OUTRO: "Serviços Gerais",
};

interface Props {
  payload: DemoWizardPayload;
}

export function OrcamentoDemoPdf({ payload }: Props) {
  const {
    oficio,
    modoServico,
    prestador,
    cliente,
    itens = [],
    verba,
    pagamento,
    validadeDias,
    observacoes,
  } = payload;

  const hoje = new Date();
  const validade = new Date(hoje);
  validade.setDate(validade.getDate() + validadeDias);
  const orcNumber = generateOrcNumber();

  const totalGeral =
    modoServico === "verba"
      ? (verba?.valorTotal ?? 0)
      : itens.reduce((acc, item) => acc + item.quantidade * item.valorUnitario, 0);

  return (
    <Document
      title={`Orçamento ${orcNumber} — PRUMO`}
      author={prestador.nome}
      creator="PRUMO"
    >
      <Page size="A4" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>PRUMO</Text>
            <Text style={styles.brandTagline}>Gestão profissional de obras</Text>
          </View>
          <View style={styles.docInfo}>
            <Text style={styles.docTitle}>ORÇAMENTO</Text>
            <Text style={styles.docNumber}>{orcNumber}</Text>
            <Text style={styles.docDate}>Emitido em: {formatDate(hoje)}</Text>
            <Text style={styles.docDate}>Válido até: {formatDate(validade)}</Text>
          </View>
        </View>

        {/* ── Prestador / Cliente ── */}
        <View style={styles.parties}>
          <View style={styles.partyBox}>
            <Text style={styles.partyLabel}>Prestador de serviço</Text>
            <Text style={styles.partyName}>{prestador.nome}</Text>
            {prestador.cpfCnpj && (
              <Text style={styles.partyDetail}>CPF/CNPJ: {formatCpfCnpj(prestador.cpfCnpj)}</Text>
            )}
            {prestador.telefone && (
              <Text style={styles.partyDetail}>Tel: {formatTelefone(prestador.telefone)}</Text>
            )}
            <Text style={styles.partyDetail}>
              Especialidade: {OFICIO_LABELS[oficio] ?? oficio}
            </Text>
          </View>
          <View style={styles.partyBox}>
            <Text style={styles.partyLabel}>Cliente / Local da obra</Text>
            <Text style={styles.partyName}>{cliente.nome}</Text>
            {cliente.endereco && (
              <Text style={styles.partyDetail}>{cliente.endereco}</Text>
            )}
          </View>
        </View>

        {/* ── Items or Verba ── */}
        {modoServico === "wizard" && itens.length > 0 ? (
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colDesc]}>Descrição do serviço</Text>
              <Text style={[styles.tableHeaderText, styles.colUnit]}>Unid.</Text>
              <Text style={[styles.tableHeaderText, styles.colQty]}>Qtd</Text>
              <Text style={[styles.tableHeaderText, styles.colPrice]}>Vlr Unit.</Text>
              <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
            </View>
            {itens.map((item: DemoItemServico, i: number) => (
              <View
                key={i}
                style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
              >
                <Text style={[styles.tableCell, styles.colDesc]}>{item.descricao}</Text>
                <Text style={[styles.tableCell, styles.colUnit]}>{item.unidade}</Text>
                <Text style={[styles.tableCell, styles.colQty]}>
                  {item.quantidade % 1 === 0
                    ? item.quantidade
                    : item.quantidade.toFixed(2)}
                </Text>
                <Text style={[styles.tableCell, styles.colPrice]}>
                  {formatBRL(item.valorUnitario)}
                </Text>
                <Text style={[styles.tableCell, styles.colTotal]}>
                  {formatBRL(item.quantidade * item.valorUnitario)}
                </Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL GERAL</Text>
              <Text style={styles.totalValue}>{formatBRL(totalGeral)}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.verbaTotalBox}>
            <Text style={styles.verbaTotalLabel}>Serviço / Descrição</Text>
            <Text style={styles.verbaTotalDesc}>
              {verba?.descricao ?? "Serviço conforme acordado"}
            </Text>
            <Text style={[styles.verbaTotalLabel, { marginTop: 10 }]}>
              Valor total (preço fechado)
            </Text>
            <Text style={styles.verbaTotalValue}>{formatBRL(totalGeral)}</Text>
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

        {/* ── Footer watermark ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>
            Gerado gratuitamente com PRUMO
          </Text>
          <Text style={styles.footerRight}>
            Crie sua conta em prumo.app e salve seus orçamentos
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function renderOrcamentoDemoToBuffer(
  payload: DemoWizardPayload,
): Promise<Buffer> {
  // Call the component directly to get the Document element.
  // renderToBuffer requires the root element to be <Document>, not a wrapper.
  const element = OrcamentoDemoPdf({ payload });
  return renderToBuffer(element);
}
