import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  transitionBookingStatus,
  isValidTransition,
  BookingTransitionError,
  ALLOWED_TRANSITIONS,
} from "@/lib/services/booking-status";
import { prisma } from "@/lib/db/prisma";
import type { BookingStatus } from "@prisma/client";

// Mock Prisma
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    booking: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    review: {
      aggregate: vi.fn(),
    },
  },
}));

describe("Booking Status Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("isValidTransition", () => {
    it("should allow PENDING → CONFIRMED", () => {
      expect(isValidTransition("PENDING", "CONFIRMED")).toBe(true);
    });

    it("should allow PENDING → CANCELLED", () => {
      expect(isValidTransition("PENDING", "CANCELLED")).toBe(true);
    });

    it("should allow CONFIRMED → COMPLETED", () => {
      expect(isValidTransition("CONFIRMED", "COMPLETED")).toBe(true);
    });

    it("should allow CONFIRMED → CANCELLED", () => {
      expect(isValidTransition("CONFIRMED", "CANCELLED")).toBe(true);
    });

    it("should reject PENDING → COMPLETED", () => {
      expect(isValidTransition("PENDING", "COMPLETED")).toBe(false);
    });

    it("should reject COMPLETED → any status", () => {
      expect(isValidTransition("COMPLETED", "PENDING")).toBe(false);
      expect(isValidTransition("COMPLETED", "CONFIRMED")).toBe(false);
      expect(isValidTransition("COMPLETED", "CANCELLED")).toBe(false);
    });

    it("should reject CANCELLED → any status", () => {
      expect(isValidTransition("CANCELLED", "PENDING")).toBe(false);
      expect(isValidTransition("CANCELLED", "CONFIRMED")).toBe(false);
      expect(isValidTransition("CANCELLED", "COMPLETED")).toBe(false);
    });

    it("should reject same-status transitions", () => {
      expect(isValidTransition("PENDING", "PENDING")).toBe(false);
      expect(isValidTransition("CONFIRMED", "CONFIRMED")).toBe(false);
      expect(isValidTransition("COMPLETED", "COMPLETED")).toBe(false);
      expect(isValidTransition("CANCELLED", "CANCELLED")).toBe(false);
    });
  });

  describe("transitionBookingStatus", () => {
    const mockBookingId = "clx1234567890abcdefgh";

    it("should successfully transition PENDING → CONFIRMED", async () => {
      // Arrange
      const mockBooking = {
        id: mockBookingId,
        status: "PENDING" as BookingStatus,
      };
      const updatedBooking = {
        ...mockBooking,
        status: "CONFIRMED" as BookingStatus,
      };

      vi.mocked(prisma.booking.findUnique).mockResolvedValue(mockBooking as never);
      vi.mocked(prisma.booking.update).mockResolvedValue(updatedBooking as never);

      // Act
      const result = await transitionBookingStatus(mockBookingId, "CONFIRMED");

      // Assert
      expect(result.status).toBe("CONFIRMED");
      expect(prisma.booking.update).toHaveBeenCalledWith({
        where: { id: mockBookingId },
        data: { status: "CONFIRMED" },
      });
    });

    it("should successfully transition CONFIRMED → COMPLETED", async () => {
      // Arrange
      const mockBooking = {
        id: mockBookingId,
        status: "CONFIRMED" as BookingStatus,
      };
      const updatedBooking = {
        ...mockBooking,
        status: "COMPLETED" as BookingStatus,
      };

      vi.mocked(prisma.booking.findUnique).mockResolvedValue(mockBooking as never);
      vi.mocked(prisma.booking.update).mockResolvedValue(updatedBooking as never);

      // Act
      const result = await transitionBookingStatus(mockBookingId, "COMPLETED");

      // Assert
      expect(result.status).toBe("COMPLETED");
    });

    it("should throw error when booking does not exist", async () => {
      // Arrange
      vi.mocked(prisma.booking.findUnique).mockResolvedValue(null);

      // Act & Assert
      await expect(
        transitionBookingStatus("non-existent", "CONFIRMED")
      ).rejects.toThrow("Booking not found");
    });

    it("should throw error for invalid transition PENDING → COMPLETED", async () => {
      // Arrange
      const mockBooking = {
        id: mockBookingId,
        status: "PENDING" as BookingStatus,
      };
      vi.mocked(prisma.booking.findUnique).mockResolvedValue(mockBooking as never);

      // Act & Assert
      await expect(
        transitionBookingStatus(mockBookingId, "COMPLETED")
      ).rejects.toThrow("Cannot change status from PENDING to COMPLETED");
    });

    it("should throw error when trying to modify COMPLETED booking", async () => {
      // Arrange
      const mockBooking = {
        id: mockBookingId,
        status: "COMPLETED" as BookingStatus,
      };
      vi.mocked(prisma.booking.findUnique).mockResolvedValue(mockBooking as never);

      // Act & Assert
      await expect(
        transitionBookingStatus(mockBookingId, "PENDING")
      ).rejects.toThrow("Cannot change status from COMPLETED to PENDING");
    });

    it("should throw error when trying to modify CANCELLED booking", async () => {
      // Arrange
      const mockBooking = {
        id: mockBookingId,
        status: "CANCELLED" as BookingStatus,
      };
      vi.mocked(prisma.booking.findUnique).mockResolvedValue(mockBooking as never);

      // Act & Assert
      await expect(
        transitionBookingStatus(mockBookingId, "CONFIRMED")
      ).rejects.toThrow("Cannot change status from CANCELLED to CONFIRMED");
    });

    it("should successfully cancel a PENDING booking", async () => {
      // Arrange
      const mockBooking = {
        id: mockBookingId,
        status: "PENDING" as BookingStatus,
      };
      const updatedBooking = {
        ...mockBooking,
        status: "CANCELLED" as BookingStatus,
      };

      vi.mocked(prisma.booking.findUnique).mockResolvedValue(mockBooking as never);
      vi.mocked(prisma.booking.update).mockResolvedValue(updatedBooking as never);

      // Act
      const result = await transitionBookingStatus(mockBookingId, "CANCELLED");

      // Assert
      expect(result.status).toBe("CANCELLED");
    });

    it("should successfully cancel a CONFIRMED booking", async () => {
      // Arrange
      const mockBooking = {
        id: mockBookingId,
        status: "CONFIRMED" as BookingStatus,
      };
      const updatedBooking = {
        ...mockBooking,
        status: "CANCELLED" as BookingStatus,
      };

      vi.mocked(prisma.booking.findUnique).mockResolvedValue(mockBooking as never);
      vi.mocked(prisma.booking.update).mockResolvedValue(updatedBooking as never);

      // Act
      const result = await transitionBookingStatus(mockBookingId, "CANCELLED");

      // Assert
      expect(result.status).toBe("CANCELLED");
    });
  });

  describe("Lifecycle enforcement", () => {
    it("ALLOWED_TRANSITIONS should define correct paths", () => {
      expect(ALLOWED_TRANSITIONS.PENDING).toEqual(["CONFIRMED", "CANCELLED"]);
      expect(ALLOWED_TRANSITIONS.CONFIRMED).toEqual(["COMPLETED", "CANCELLED"]);
      expect(ALLOWED_TRANSITIONS.COMPLETED).toEqual([]);
      expect(ALLOWED_TRANSITIONS.CANCELLED).toEqual([]);
    });

    it("terminal states should have no outbound transitions", () => {
      const terminalStates: BookingStatus[] = ["COMPLETED", "CANCELLED"];
      terminalStates.forEach((status) => {
        expect(ALLOWED_TRANSITIONS[status]).toHaveLength(0);
      });
    });

    it("all non-terminal states should have at least one valid transition", () => {
      const nonTerminalStates: BookingStatus[] = ["PENDING", "CONFIRMED"];
      nonTerminalStates.forEach((status) => {
        expect(ALLOWED_TRANSITIONS[status].length).toBeGreaterThan(0);
      });
    });
  });
});