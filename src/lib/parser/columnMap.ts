import type { AttributeKey } from "@/lib/types";
import { ATTRIBUTE_ALIASES, BIO_ALIASES, normalizeHeader, type AttributeGroup, type BioField } from "./attributeAliases";

export type ColumnEntry =
  | { index: number; kind: "attribute"; key: AttributeKey; group: AttributeGroup; header: string }
  | { index: number; kind: "bio"; key: BioField; header: string }
  | { index: number; kind: "unrecognized"; header: string };

type ReverseEntry =
  | { kind: "attribute"; key: AttributeKey; group: AttributeGroup }
  | { kind: "bio"; key: BioField };

function buildReverseMap(): Map<string, ReverseEntry> {
  const map = new Map<string, ReverseEntry>();
  for (const [key, { group, variants }] of Object.entries(ATTRIBUTE_ALIASES)) {
    for (const variant of variants) {
      map.set(variant, { kind: "attribute", key: key as AttributeKey, group });
    }
  }
  for (const [key, variants] of Object.entries(BIO_ALIASES)) {
    for (const variant of variants) {
      map.set(variant, { kind: "bio", key: key as BioField });
    }
  }
  return map;
}

const REVERSE_MAP = buildReverseMap();

export function buildColumnMap(headers: string[]): { columns: ColumnEntry[]; unrecognizedHeaders: string[] } {
  const columns: ColumnEntry[] = [];
  const unrecognizedHeaders: string[] = [];

  headers.forEach((header, index) => {
    const normalized = normalizeHeader(header);
    const match = REVERSE_MAP.get(normalized);
    if (!match) {
      columns.push({ index, kind: "unrecognized", header });
      if (header.trim()) unrecognizedHeaders.push(header);
      return;
    }
    if (match.kind === "attribute") {
      columns.push({ index, kind: "attribute", key: match.key, group: match.group, header });
    } else {
      columns.push({ index, kind: "bio", key: match.key, header });
    }
  });

  return { columns, unrecognizedHeaders };
}
