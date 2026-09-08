import { describe, it, expect } from "vitest";
import { leadSchema } from "@/lib/validations/lead";
import { registerSchema, loginSchema } from "@/lib/validations/auth";
import { bookingSchema } from "@/lib/validations/booking";

describe("Lead validation", () => {
  it("accepts valid lead input", () => {
    const result = leadSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      careerStage: "EARLY_CAREER",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = leadSchema.safeParse({
      name: "John Doe",
      // missing email and careerStage
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = leadSchema.safeParse({
      name: "John Doe",
      email: "not-an-email",
      careerStage: "EARLY_CAREER",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short name", () => {
    const result = leadSchema.safeParse({
      name: "J",
      email: "john@example.com",
      careerStage: "EARLY_CAREER",
    });
    expect(result.success).toBe(false);
  });
});

describe("Register validation", () => {
  it("accepts valid registration", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "SecurePass123",
      confirmPassword: "SecurePass123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "SecurePass123",
      confirmPassword: "DifferentPass456",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "Short1",
      confirmPassword: "Short1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without uppercase", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "lowercase123",
      confirmPassword: "lowercase123",
    });
    expect(result.success).toBe(false);
  });
});

describe("Login validation", () => {
  it("accepts valid login", () => {
    const result = loginSchema.safeParse({
      email: "john@example.com",
      password: "SecurePass123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "SecurePass123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing password", () => {
    const result = loginSchema.safeParse({
      email: "john@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("Booking validation", () => {
  const booking = {
    phone: "",
    careerStage: "STUDENT",
    currentRole: "Student",
    targetRole: "Software developer",
    careerGoal: "Prepare a focused graduate job search strategy.",
    additionalContext: "",
    serviceId: "service_123",
    preferredDate: "2026-09-08",
    preferredSlot: "10:00",
  };

  it("accepts a candidate booking payload without browser-provided identity", () => {
    expect(bookingSchema.safeParse(booking).success).toBe(true);
  });

  it("rejects a booking without a selected time", () => {
    expect(bookingSchema.safeParse({ ...booking, preferredSlot: "" }).success).toBe(false);
  });
});
