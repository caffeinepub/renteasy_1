import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === "logging-in";
  const text =
    loginStatus === "logging-in"
      ? "Logging in..."
      : isAuthenticated
        ? "Logout"
        : "Login";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error("Login error:", error);
        if (error.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleAuth}
      disabled={disabled}
      className={`px-5 py-2 rounded-lg transition-all font-medium text-sm inline-flex items-center gap-2 ${
        isAuthenticated
          ? "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
          : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loginStatus === "logging-in" && (
        <Loader2 className="h-4 w-4 animate-spin" />
      )}
      {text}
    </button>
  );
}
