import { toggleBookmark } from "@/services/bookmarks";

jest.mock("@/services/bookmarks", () => ({
  toggleBookmark: jest.fn(),
}));

describe("Bookmark Service", () => {
  const jobId = "12345";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call API to add a bookmark when not bookmarked", async () => {
    (toggleBookmark as jest.Mock).mockResolvedValue(true);

    const result = await toggleBookmark(jobId, false);

    expect(toggleBookmark).toHaveBeenCalledWith(jobId, false);
    expect(result).toBe(true);
  });

  it("should call API to remove a bookmark when already bookmarked", async () => {
    (toggleBookmark as jest.Mock).mockResolvedValue(false);

    const result = await toggleBookmark(jobId, true);

    expect(toggleBookmark).toHaveBeenCalledWith(jobId, true);
    expect(result).toBe(false);
  });

  it("should throw an error if API fails", async () => {
    (toggleBookmark as jest.Mock).mockRejectedValue(new Error("API error"));

    await expect(toggleBookmark(jobId, false)).rejects.toThrow("API error");
  });
});
