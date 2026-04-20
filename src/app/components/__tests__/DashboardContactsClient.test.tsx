import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import DashboardContactsClient from "../DashboardContactsClient";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

global.fetch = jest.fn();

jest.mock("@/app/components/ContactDetailCard", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/app/components/ChangePasswordModal", () => ({
  __esModule: true,
  default: () => null,
}));

describe("DashboardContactsClient — acheteurs only", () => {
  beforeEach(() => {
    fetch.mockClear();
    mockPush.mockClear();

    fetch.mockImplementation((url: string | URL | Request): Promise<Response> => {
      const u = String(url);
      if (u.includes("/api/auth/verify")) {
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
          json: async () => [
            {
              id: "1",
              name: "John Buyer",
              phone: "+212612345678",
              email: "j@example.com",
              type: "BUYER",
              budget: "1000000",
              status: "NEW",
              confidential: false,
              createdAt: "2024-01-01T00:00:00Z",
              updatedAt: "2024-01-01T00:00:00Z",
            },
            {
              id: "2",
              name: "Jane Seller",
              phone: "+212612345679",
              type: "SELLER",
              estimation: "2000000",
              status: "CONTACTED",
              confidential: false,
              createdAt: "2024-01-02T00:00:00Z",
              updatedAt: "2024-01-02T00:00:00Z",
            },
          ],
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      } as Response);
    });
  });

  test("liste uniquement les acheteurs et filtre par recherche", async () => {
    const user = userEvent.setup();
    render(<DashboardContactsClient contactKind="BUYER" />);

    await waitFor(() => {
      expect(screen.getByText("John Buy")).toBeInTheDocument();
    });

    expect(screen.queryByText("Jane Sell")).not.toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(
      /rechercher par nom/i,
    );
    await user.type(searchInput, "Jane");

    await waitFor(() => {
      expect(screen.queryByText("John Buy")).not.toBeInTheDocument();
    });
  });
});
