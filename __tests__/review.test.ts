import { describe, it, expect, beforeEach, vi } from "vitest";
import { submitReviewForBooking, ReviewError } from "@/lib/services/review-service";
import { prisma } from "@/lib/db/prisma";

// Mock Prisma
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    booking: {
      findUnique: vi.fn(),
    },
    review: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("Review Service", () => {
  const mockCandidateId = "clx1234567890abcdefgh";
  const mockBookingId = "clx9876543210zyxwvuts";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("submitReviewForBooking", () => {
    it("should successfully submit a review for a completed booking", async () => {
      // Arrange
      const mockBooking = {
        id: mockBookingId,
        candidateId: mockCandidateId,
        status: "COMPLETED",
      };
      const mockReview = {
        id: "review-789",
        bookingId: mockBookingId,
        candidateId: mockCandidateId,
        rating: 5,
        comment: "Great session!",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.booking.findUnique).mockResolvedValue(mockBooking as never);
      vi.mocked(prisma.review.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.review.create).mockResolvedValue(mockReview as never);

      // Act
      const result = await submitReviewForBooking(mockCandidateId, {
        bookingId: mockBookingId,
        rating: 5,
        comment: "Great session!",
      });

      // Assert
      expect(result).toEqual(mockReview);
      expect(prisma.booking.findUnique).toHaveBeenCalledWith({
        where: { id: mockBookingId },
        select: { id: true, candidateId: true, status: true },
      });
      expect(prisma.review.findUnique).toHaveBeenCalledWith({
        where: { bookingId: mockBookingId },
      });
      expect(prisma.review.create).toHaveBeenCalledWith({
        data: {
          bookingId: mockBookingId,
          candidateId: mockCandidateId,
          rating: 5,
          comment: "Great session!",
        },
      });
    });

    it("should reject review with invalid rating (below 1)", async () => {
      // Act & Assert
      await expect(
        submitReviewForBooking(mockCandidateId, {
          bookingId: mockBookingId,
          rating: 0,
          comment: "Test",
        })
      ).rejects.toThrow(ReviewError);
    });

    it("should reject review with invalid rating (above 5)", async () => {
      // Act & Assert
      await expect(
        submitReviewForBooking(mockCandidateId, {
          bookingId: mockBookingId,
          rating: 6,
          comment: "Test",
        })
      ).rejects.toThrow(ReviewError);
    });

    it("should reject review when booking does not exist", async () => {
      // Arrange
      vi.mocked(prisma.booking.findUnique).mockResolvedValue(null);

      // Act & Assert
      await expect(
        submitReviewForBooking(mockCandidateId, {
          bookingId: "clxnonexistent123456",
          rating: 5,
        })
      ).rejects.toThrow("That booking could not be found");
    });

    it("should reject review when booking belongs to different candidate", async () => {
      // Arrange
      const mockBooking = {
        id: mockBookingId,
        candidateId: "different-candidate",
        status: "COMPLETED",
      };
      vi.mocked(prisma.booking.findUnique).mockResolvedValue(mockBooking as never);

      // Act & Assert
      await expect(
        submitReviewForBooking(mockCandidateId, {
          bookingId: mockBookingId,
          rating: 5,
        })
      ).rejects.toThrow("You can only review your own sessions");
    });

    it("should reject review when booking status is PENDING", async () => {
      // Arrange
      const mockBooking = {
        id: mockBookingId,
        candidateId: mockCandidateId,
        status: "PENDING",
      };
      vi.mocked(prisma.booking.findUnique).mockResolvedValue(mockBooking as never);

      // Act & Assert
      await expect(
        submitReviewForBooking(mockCandidateId, {
          bookingId: mockBookingId,
          rating: 5,
        })
      ).rejects.toThrow("Reviews are only available after your session is completed");
    });

    it("should reject review when booking status is CONFIRMED", async () => {
      // Arrange
      const mockBooking = {
        id: mockBookingId,
        candidateId: mockCandidateId,
        status: "CONFIRMED",
      };
      vi.mocked(prisma.booking.findUnique).mockResolvedValue(mockBooking as never);

      // Act & Assert
      await expect(
        submitReviewForBooking(mockCandidateId, {
          bookingId: mockBookingId,
          rating: 5,
        })
      ).rejects.toThrow("Reviews are only available after your session is completed");
    });

    it("should reject review when booking status is CANCELLED", async () => {
      // Arrange
      const mockBooking = {
        id: mockBookingId,
        candidateId: mockCandidateId,
        status: "CANCELLED",
      };
      vi.mocked(prisma.booking.findUnique).mockResolvedValue(mockBooking as never);

      // Act & Assert
      await expect(
        submitReviewForBooking(mockCandidateId, {
          bookingId: mockBookingId,
          rating: 5,
        })
      ).rejects.toThrow("Reviews are only available after your session is completed");
    });

    it("should reject duplicate review for the same booking", async () => {
      // Arrange
      const mockBooking = {
        id: mockBookingId,
        candidateId: mockCandidateId,
        status: "COMPLETED",
      };
      const existingReview = {
        id: "existing-review",
        bookingId: mockBookingId,
        candidateId: mockCandidateId,
        rating: 4,
        comment: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.booking.findUnique).mockResolvedValue(mockBooking as never);
      vi.mocked(prisma.review.findUnique).mockResolvedValue(existingReview as never);

      // Act & Assert
      await expect(
        submitReviewForBooking(mockCandidateId, {
          bookingId: mockBookingId,
          rating: 5,
        })
      ).rejects.toThrow("You've already shared your feedback for this session");
    });

    it("should accept review without comment (comment is optional)", async () => {
      // Arrange
      const mockBooking = {
        id: mockBookingId,
        candidateId: mockCandidateId,
        status: "COMPLETED",
      };
      const mockReview = {
        id: "review-789",
        bookingId: mockBookingId,
        candidateId: mockCandidateId,
        rating: 4,
        comment: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.booking.findUnique).mockResolvedValue(mockBooking as never);
      vi.mocked(prisma.review.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.review.create).mockResolvedValue(mockReview as never);

      // Act
      const result = await submitReviewForBooking(mockCandidateId, {
        bookingId: mockBookingId,
        rating: 4,
      });

      // Assert
      expect(result).toEqual(mockReview);
      expect(prisma.review.create).toHaveBeenCalledWith({
        data: {
          bookingId: mockBookingId,
          candidateId: mockCandidateId,
          rating: 4,
          comment: undefined,
        },
      });
    });

    it("should accept all valid ratings from 1 to 5", async () => {
      // Arrange
      const mockBooking = {
        id: mockBookingId,
        candidateId: mockCandidateId,
        status: "COMPLETED",
      };

      vi.mocked(prisma.booking.findUnique).mockResolvedValue(mockBooking as never);
      vi.mocked(prisma.review.findUnique).mockResolvedValue(null);

      // Act & Assert
      for (let rating = 1; rating <= 5; rating++) {
        const mockReview = {
          id: `review-${rating}`,
          bookingId: mockBookingId,
          candidateId: mockCandidateId,
          rating,
          comment: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        vi.mocked(prisma.review.create).mockResolvedValue(mockReview as never);

        const result = await submitReviewForBooking(mockCandidateId, {
          bookingId: mockBookingId,
          rating,
        });

        expect(result.rating).toBe(rating);
      }
    });
  });
});