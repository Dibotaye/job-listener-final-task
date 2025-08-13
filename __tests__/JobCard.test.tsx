import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JobCard from "@/components/JobCard";
import * as bookmarksApi from "@/services/bookmarks";

jest.mock("@/services/bookmarks", () => ({
  toggleBookmark: jest.fn(),
}));

describe("JobCard Component", () => {
  const mockJob = {
    id: "65509e9353a7667de6ef5a60", // ✅ match component's expected prop
    title: "Software Engineer",
    orgName: "Tech Corp",
    location: ["Remote"],
    description: "An exciting role",
    logoUrl: "/logo.png",
    datePosted: "2024-07-17T11:09:02.207Z",
    opType: "Full-time",
    isBookmarked: false, // ✅ initial state
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders job details correctly", () => {
    render(<JobCard job={mockJob} onClick={jest.fn()} />);

    expect(screen.getByTestId("job-title")).toHaveTextContent(
      "Software Engineer"
    );
    expect(screen.getByTestId("company-name")).toHaveTextContent("Tech Corp");
    expect(screen.getByTestId("job-location")).toHaveTextContent("Remote");
    expect(screen.getByTestId("job-description")).toHaveTextContent(
      "An exciting role"
    );
  });

  test("calls toggleBookmark when bookmark button is clicked", async () => {
    const user = userEvent.setup();
    (bookmarksApi.toggleBookmark as jest.Mock).mockResolvedValue(true);

    render(<JobCard job={mockJob} onClick={jest.fn()} />);

    await user.click(screen.getByTestId("bookmark-btn"));

    expect(bookmarksApi.toggleBookmark).toHaveBeenCalledWith(
      "65509e9353a7667de6ef5a60", // ✅ matches job.id
      false // ✅ matches initial isBookmarked
    );
  });
});
