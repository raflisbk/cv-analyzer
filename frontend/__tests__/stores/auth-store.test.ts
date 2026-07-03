import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/stores/auth-store";

describe("auth-store", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isLoading: false,
      isHydrated: false,
    });
  });

  it("has correct initial state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.isHydrated).toBe(false);
  });

  describe("setUser", () => {
    it("sets user data", () => {
      const mockUser = {
        id: "u1",
        email: "test@example.com",
        name: "Test User",
        picture: "https://avatar.url/pic.jpg",
      };

      useAuthStore.getState().setUser(mockUser);
      expect(useAuthStore.getState().user).toEqual(mockUser);
    });

    it("can set user to null (logout)", () => {
      useAuthStore.getState().setUser({
        id: "u1",
        email: "test@example.com",
        name: "Test",
        picture: null,
      });
      useAuthStore.getState().setUser(null);
      expect(useAuthStore.getState().user).toBeNull();
    });

    it("handles user without picture", () => {
      useAuthStore.getState().setUser({
        id: "u2",
        email: "no-pic@example.com",
        name: "No Pic",
        picture: null,
      });
      expect(useAuthStore.getState().user!.picture).toBeNull();
    });

    it("handles user without name", () => {
      useAuthStore.getState().setUser({
        id: "u3",
        email: "noname@example.com",
        name: null,
        picture: null,
      });
      expect(useAuthStore.getState().user!.name).toBeNull();
    });
  });

  describe("setLoading", () => {
    it("sets loading state", () => {
      useAuthStore.getState().setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);

      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe("setHydrated", () => {
    it("sets hydrated state", () => {
      useAuthStore.getState().setHydrated(true);
      expect(useAuthStore.getState().isHydrated).toBe(true);
    });
  });
});
