import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import DashboardHubPage from "../page";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

global.fetch = jest.fn();

describe("Dashboard hub", () => {
  const mockContacts = [
    {
      id: "1",
      name: "John Doe",
      phone: "+212612345678",
      email: "john@example.com",
      type: "BUYER",
      budget: "1000000",
      status: "NEW",
      personalNote: "Test note",
      rating: 4,
      confidential: false,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      name: "Jane Smith",
      phone: "+212612345679",
      email: "jane@example.com",
      type: "SELLER",
      estimation: "2000000",
      status: "CONTACTED",
      personalNote: null,
      rating: 5,
      confidential: true,
      createdAt: "2024-01-02T00:00:00Z",
      updatedAt: "2024-01-02T00:00:00Z",
    },
  ];

  beforeEach(() => {
    fetch.mockClear();
    mockPush.mockClear();

    fetch.mockImplementation(
      (
        url: string | URL | Request,
        options?: RequestInit,
      ): Promise<Response> => {
        const u = String(url);
        if (u.includes("/api/auth/verify")) {
          if (options?.method === "POST") {
            return Promise.resolve({
              ok: true,
              json: async () => ({ message: "ok" }),
            } as Response);
          }
          return Promise.resolve({
            ok: true,
            json: async () => ({
              authenticated: true,
              admin: { username: "admin" },
            }),
          } as Response);
        }
        if (u.includes("/api/contacts")) {
          return Promise.resolve({
            ok: true,
            json: async () => mockContacts,
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        } as Response);
      },
    );
  });

  test("renders overview with statistics and CRM entry links", async () => {
    render(<DashboardHubPage />);

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Nouveaux contacts")).toBeInTheDocument();
      expect(screen.getByText("Acheteurs actifs")).toBeInTheDocument();
      expect(screen.getByText("Propriétaires actifs")).toBeInTheDocument();
      expect(screen.getByText("Ventes conclues")).toBeInTheDocument();
    });

    const nav = screen.getByRole("navigation");
    expect(
      within(nav).getByRole("link", { name: /^Acheteurs$/ }),
    ).toHaveAttribute("href", "/dashboard/acheteurs");
    expect(
      within(nav).getByRole("link", { name: /^Propriétaires$/ }),
    ).toHaveAttribute("href", "/dashboard/proprietaires");
  });

  test("logout redirects to login", async () => {
    const user = userEvent.setup();
    render(<DashboardHubPage />);

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /déconnexion/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });
});
