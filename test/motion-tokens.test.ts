import { describe, it, expect } from "vitest";
import {
  SPRING_MICRO,
  SPRING_VIEW,
  PIPELINE_STAGE_VARIANTS,
  REDUCED_MOTION_VARIANTS,
} from "../lib/motion";

describe("Phase 4: Motion Design & Spring Physics Tokens", () => {
  it("enforces exact spring tokens for micro-interactions", () => {
    expect(SPRING_MICRO.stiffness).toBe(380);
    expect(SPRING_MICRO.damping).toBe(30);
    expect(SPRING_MICRO.type).toBe("spring");
  });

  it("enforces exact spring tokens for page/view transitions", () => {
    expect(SPRING_VIEW.stiffness).toBe(200);
    expect(SPRING_VIEW.damping).toBe(25);
    expect(SPRING_VIEW.type).toBe("spring");
  });

  it("configures pipeline stage tracker animations without bouncy cartoony effects", () => {
    expect(PIPELINE_STAGE_VARIANTS.completed.scale).toEqual([1, 1.04, 1]);
    expect(PIPELINE_STAGE_VARIANTS.completed.transition.duration).toBe(0.2);

    expect(PIPELINE_STAGE_VARIANTS.active.opacity).toEqual([0.6, 1, 0.6]);
    expect(PIPELINE_STAGE_VARIANTS.active.transition.duration).toBe(2.0);
    expect(PIPELINE_STAGE_VARIANTS.active.transition.repeat).toBe(Infinity);
  });

  it("provides accessible reduced motion fallbacks", () => {
    expect(REDUCED_MOTION_VARIANTS.active.opacity).toBe(1);
    expect(REDUCED_MOTION_VARIANTS.completed.opacity).toBe(1);
  });
});
