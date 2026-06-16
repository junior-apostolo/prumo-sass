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
import type { OrcamentoPdfData, ItemOrcamentoRecord, ItemCategoria } from "../interfaces/orcamento.interfaces.js";

const BLUE = "#1e3a5f";
const BLUE_LIGHT = "#e8f0fe";
const GRAY = "#6b7280";
const GRAY_LIGHT = "#f3f4f6";
const BLACK = "#111827";

const CATEGORIA_LABELS: Record<ItemCategoria, string> = {
  MATERIAL: "Material",
  MAO_DE_OBRA: "Mão de Obra",
  EQUIPAMENTO: "Equipamento",
  SERVICO: "Serviço",
  OUTROS: "Outros",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: BLACK,
    paddingTop: 40,
    paddingBottom: 70,
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
  obraBox: {
    backgroundColor: BLUE_LIGHT,
    borderRadius: 4,
    padding: 8,
    marginBottom: 14,
    flexDirection: "row",
    gap: 16,
  },
  obraLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: BLUE, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 2 },
  obraValue: { fontSize: 8.5, color: BLACK },
  parties: { flexDirection: "row", gap: 12, marginBottom: 16 },
  partyBox: { flex: 1, backgroundColor: GRAY_LIGHT, borderRadius: 4, padding: 10 },
  partyLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: BLUE, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 5 },
  partyName: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: BLACK, marginBottom: 2 },
  partyDetail: { fontSize: 8, color: GRAY, marginBottom: 1 },
  tableContainer: { marginBottom: 4 },
  tableHeader: { flexDirection: "row", backgroundColor: BLUE, paddingVertical: 6, paddingHorizontal: 8 },
  tableHeaderText: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  categoryHeader: { flexDirection: "row", backgroundColor: BLUE_LIGHT, paddingVertical: 4, paddingHorizontal: 8 },
  categoryHeaderText: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: BLUE },
  tableRow: { flexDirection: "row", paddingVertical: 5, paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: "#e5e7eb" },
  tableRowAlt: { backgroundColor: GRAY_LIGHT },
  tableCell: { fontSize: 8.5, color: BLACK },
  colDesc: { flex: 5 },
  colUnit: { flex: 1.2, textAlign: "center" },
  colQty: { flex: 1, textAlign: "right" },
  colPrice: { flex: 1.8, textAlign: "right" },
  colTotal: { flex: 1.8, textAlign: "right" },
  subtotalRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: BLUE,
    marginBottom: 6,
  },
  subtotalLabel: { flex: 9, fontSize: 8, fontFamily: "Helvetica-Bold", color: BLUE, textAlign: "right", paddingRight: 8 },
  subtotalValue: { flex: 2, fontSize: 8, fontFamily: "Helvetica-Bold", color: BLUE, textAlign: "right" },
  totalRow: { flexDirection: "row", backgroundColor: BLUE, paddingVertical: 8, paddingHorizontal: 8, marginTop: 4, marginBottom: 14 },
  totalLabel: { flex: 9, fontSize: 9, fontFamily: "Helvetica-Bold", color: "#ffffff", textAlign: "right", paddingRight: 8 },
  totalValue: { flex: 2, fontSize: 10, fontFamily: "Helvetica-Bold", color: "#ffffff", textAlign: "right" },
  conditionsRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  conditionBox: { flex: 1, borderWidth: 0.5, borderColor: "#d1d5db", borderRadius: 4, padding: 8 },
  conditionLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: BLUE, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 3 },
  conditionValue: { fontSize: 8.5, color: BLACK },
  obsBox: { borderWidth: 0.5, borderColor: "#d1d5db", borderRadius: 4, padding: 8, marginBottom: 16 },
  obsLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: BLUE, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 3 },
  obsText: { fontSize: 8.5, color: BLACK, lineHeight: 1.5 },
  signatureBox: {
    flexDirection: "row",
    gap: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  signatureLine: {
    flex: 1,
    borderTopWidth: 0.5,
    borderTopColor: GRAY,
    paddingTop: 4,
  },
  signatureLabel: { fontSize: 7.5, color: GRAY, textAlign: "center" },
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
  footerRight: { fontSize: 7.5, color: BLUE_LIGHT },
});

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
}

interface GroupedItems {
  categoria: ItemCategoria;
  itens: ItemOrcamentoRecord[];
  subtotal: number;
}

function groupByCategoria(itens: ItemOrcamentoRecord[]): GroupedItems[] {
  const map = new Map<ItemCategoria, ItemOrcamentoRecord[]>();
  for (const item of itens) {
    const list = map.get(item.categoria) ?? [];
    list.push(item);
    map.set(item.categoria, list);
  }
  return Array.from(map.entries()).map(([categoria, itens]) => ({
    categoria,
    itens,
    subtotal: itens.reduce(
      (sum, i) => sum + parseFloat(i.quantidade) * parseFloat(i.valorUnitario),
      0,
    ),
  }));
}

interface Props {
  data: OrcamentoPdfData;
}

export function OrcamentoPdf({ data }: Props) {
  const { orcamento, obra, workspace } = data;
  const grupos = groupByCategoria(orcamento.itens);
  const totalGeral = grupos.reduce((sum, g) => sum + g.subtotal, 0);
  const hoje = new Date();
  const hasMultipleGroups = grupos.length > 1;

  return (
    <Document
      title={`Orçamento v${orcamento.versao} — ${orcamento.titulo}`}
      author={workspace.name}
      creator="PRUMO"
    >
      <Page size="A4" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            {workspace.logoUrl ? (
              <Image src={workspace.logoUrl} style={styles.logo} />
            ) : (
              <Text style={styles.workspaceName}>{workspace.name}</Text>
            )}
            {workspace.cnpj && (
              <Text style={styles.workspaceSub}>CNPJ: {workspace.cnpj}</Text>
            )}
          </View>
          <View style={styles.docInfo}>
            <Text style={styles.docTitle}>ORÇAMENTO</Text>
            <Text style={styles.docSub}>v{orcamento.versao} · {orcamento.titulo}</Text>
            <Text style={styles.docSub}>Emitido em: {formatDate(hoje)}</Text>
            {orcamento.validadeAt && (
              <Text style={styles.docSub}>
                Válido até: {formatDate(orcamento.validadeAt)}
              </Text>
            )}
          </View>
        </View>

        {/* ── Obra ── */}
        <View style={styles.obraBox}>
          <View>
            <Text style={styles.obraLabel}>Obra</Text>
            <Text style={styles.obraValue}>{obra.nome}</Text>
          </View>
          {obra.cliente && (
            <View>
              <Text style={styles.obraLabel}>Cliente</Text>
              <Text style={styles.obraValue}>{obra.cliente}</Text>
            </View>
          )}
          {obra.endereco && (
            <View>
              <Text style={styles.obraLabel}>Endereço</Text>
              <Text style={styles.obraValue}>{obra.endereco}</Text>
            </View>
          )}
        </View>

        {/* ── Itens agrupados por categoria ── */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDesc]}>Descrição</Text>
            <Text style={[styles.tableHeaderText, styles.colUnit]}>Unid.</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qtd</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>Vlr Unit.</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
          </View>

          {grupos.map((grupo, gi) => (
            <View key={grupo.categoria}>
              {hasMultipleGroups && (
                <View style={styles.categoryHeader}>
                  <Text style={[styles.categoryHeaderText, styles.colDesc]}>
                    {CATEGORIA_LABELS[grupo.categoria]}
                  </Text>
                </View>
              )}
              {grupo.itens.map((item, i) => {
                const qty = parseFloat(item.quantidade);
                const price = parseFloat(item.valorUnitario);
                return (
                  <View
                    key={item.id}
                    style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
                  >
                    <Text style={[styles.tableCell, styles.colDesc]}>{item.descricao}</Text>
                    <Text style={[styles.tableCell, styles.colUnit]}>{item.unidade}</Text>
                    <Text style={[styles.tableCell, styles.colQty]}>
                      {qty % 1 === 0 ? qty : qty.toFixed(2)}
                    </Text>
                    <Text style={[styles.tableCell, styles.colPrice]}>{formatBRL(price)}</Text>
                    <Text style={[styles.tableCell, styles.colTotal]}>{formatBRL(qty * price)}</Text>
                  </View>
                );
              })}
              {hasMultipleGroups && (
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>
                    Subtotal {CATEGORIA_LABELS[grupo.categoria]}
                  </Text>
                  <Text style={styles.subtotalValue}>{formatBRL(grupo.subtotal)}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL GERAL</Text>
          <Text style={styles.totalValue}>{formatBRL(totalGeral)}</Text>
        </View>

        {/* ── Observações ── */}
        {orcamento.observacoes && (
          <View style={styles.obsBox}>
            <Text style={styles.obsLabel}>Observações</Text>
            <Text style={styles.obsText}>{orcamento.observacoes}</Text>
          </View>
        )}

        {/* ── Assinaturas ── */}
        <View style={styles.signatureBox}>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureLabel}>{workspace.name}</Text>
            <Text style={styles.signatureLabel}>Prestador de serviço</Text>
          </View>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureLabel}>{obra.cliente ?? "Cliente"}</Text>
            <Text style={styles.signatureLabel}>Contratante</Text>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>{workspace.name}</Text>
          <Text style={styles.footerRight}>
            {[workspace.telefone, workspace.emailContato, workspace.cnpj]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function renderOrcamentoToBuffer(data: OrcamentoPdfData): Promise<Buffer> {
  const element = OrcamentoPdf({ data });
  return renderToBuffer(element);
}
