import { useEffect, useCallback } from "react";
import { useTimeClockStore } from "@/stores/timeClockStore";

export function useInstallPrompt() {
  const promptEvent = useTimeClockStore((state) => state.installPromptEvent);
  const setPromptEvent = useTimeClockStore((state) => state.setInstallPromptEvent);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [setPromptEvent]);

  useEffect(() => {
    const handler = () => setPromptEvent(undefined);
    window.addEventListener("appinstalled", handler);
    return () => window.removeEventListener("appinstalled", handler);
  }, [setPromptEvent]);

  const install = useCallback(async () => {
    if (!promptEvent) return { outcome: "dismissed" as const };
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    setPromptEvent(undefined);
    return choice;
  }, [promptEvent, setPromptEvent]);

  return {
    promptEvent,
    install,
    isSupported: Boolean(promptEvent),
  };
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}
