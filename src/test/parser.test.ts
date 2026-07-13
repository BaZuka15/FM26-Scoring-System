import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseFmHtml } from "@/lib/parser/parseFmHtml";

const fixtureHtml = readFileSync(join(__dirname, "fixtures/sample-export.html"), "utf-8");

describe("parseFmHtml", () => {
  const result = parseFmHtml(fixtureHtml);

  it("parses every player row", () => {
    expect(result.players).toHaveLength(7);
  });

  it("surfaces unrecognized columns without dropping their data", () => {
    expect(result.unrecognizedHeaders).toContain("Personality");
    const diego = result.players.find((p) => p.name === "Diego Marchetti")!;
    expect(diego.extra["Personality"]).toBe("Model Citizen");
  });

  it("parses a straightforward outfield player's bio and attributes", () => {
    const diego = result.players.find((p) => p.name === "Diego Marchetti")!;
    expect(diego.age).toBe(24);
    expect(diego.club).toBe("Porto");
    expect(diego.nationality).toBe("Portugal");
    expect(diego.preferredFoot).toBe("Right");
    expect(diego.isGoalkeeper).toBe(false);
    expect(diego.positions).toEqual([{ group: "D", sides: ["C"] }]);
    expect(diego.technical?.tackling).toBe(16);
    expect(diego.mental?.positioning).toBe(16);
    expect(diego.physical?.jumpingReach).toBe(14);
    expect(diego.goalkeeping).not.toBeNull();
    expect(diego.goalkeeping?.reflexes).toBeNull();
  });

  it("parses transfer value and wage strings into numeric ranges", () => {
    const diego = result.players.find((p) => p.name === "Diego Marchetti")!;
    expect(diego.transferValueNumeric).toEqual({ min: 8_000_000, max: 10_000_000 });
    expect(diego.wageNumeric).toBe(45_000);
  });

  it("parses multi-position players into multiple position tokens", () => {
    const kwame = result.players.find((p) => p.name === "Kwame Osei")!;
    expect(kwame.positions).toEqual([
      { group: "D", sides: ["R", "C"] },
      { group: "WB", sides: ["R"] },
    ]);
  });

  it("takes the midpoint of a range-valued (unscouted) attribute and keeps the raw range", () => {
    const kwame = result.players.find((p) => p.name === "Kwame Osei")!;
    expect(kwame.mental?.determination).toBe(12);
    expect(kwame.attributeRanges.determination).toBe("10-14");
  });

  it("treats a dash as unknown (null), never as zero", () => {
    const samir = result.players.find((p) => p.name === "Samir Haddad")!;
    expect(samir.mental?.flair).toBeNull();
    expect(samir.attributeRanges.flair).toBeUndefined();
  });

  it("identifies goalkeepers and populates their goalkeeping attributes", () => {
    const tomas = result.players.find((p) => p.name === "Tomás Duarte")!;
    expect(tomas.isGoalkeeper).toBe(true);
    expect(tomas.goalkeeping?.reflexes).toBe(15);
    expect(tomas.goalkeeping?.aerialReach).toBe(13);
    // GKs still carry the shared Technical group (passing/first touch/technique).
    expect(tomas.technical?.passing).toBe(12);
    expect(tomas.technical?.corners).toBeNull();
  });
});
