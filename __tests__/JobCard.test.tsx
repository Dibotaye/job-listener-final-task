import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import JobCard from "../components/JobCard";
import { toggleBookmark } from "../services/bookmarks";

jest.mock("../services/bookmarks", () => ({
  toggleBookmark: jest.fn(),
}));
jest.mock("../services/auth", () => ({
  isAuthenticated: jest.fn(() => true),
}));

describe("JobCard Component", () => {
  const mockJob = {
    id: "1",
    title: "Software Engineer",
    orgName: "Tech Corp",
    location: ["Remote"],
    description: "An exciting role",
    categories: ["Engineering"],
    opType: "Full-time",
    datePosted: "2025-08-12",
    deadline: "2025-09-01",
    isBookmarked: false,
  };

  const onClickMock = jest.fn();
  const onBookmarkChangeMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders job details correctly", () => {
    render(
      <JobCard
        job={mockJob}
        onClick={onClickMock}
        onBookmarkChange={onBookmarkChangeMock}
      />
    );

    expect(screen.getByTestId("job-title")).toHaveTextContent(
      "Software Engineer"
    );
    expect(screen.getByTestId("company-name")).toHaveTextContent("Tech Corp");
    expect(screen.getByTestId("job-location")).toHaveTextContent("Remote");
  });

  it("calls toggleBookmark when bookmark button is clicked", async () => {
    (toggleBookmark as jest.Mock).mockResolvedValue(true);

    render(
      <JobCard
        job={mockJob}
        onClick={onClickMock}
        onBookmarkChange={onBookmarkChangeMock}
      />
    );

    fireEvent.click(screen.getByTestId("bookmark-button"));

    expect(toggleBookmark).toHaveBeenCalledWith("1", false);
  });

  it("matches snapshot", () => {
    const { asFragment } = render(
      <JobCard job={mockJob} onClick={onClickMock} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
