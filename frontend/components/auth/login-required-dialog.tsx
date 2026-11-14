"use client";

import { useT } from "@/components/i18n/i18n-provider";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { safeNextPath } from "@/lib/auth-next-path";
import styles from "./login-dialog.module.css";

export function LoginRequiredDialog() {
  const { t } = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [nextPath, setNextPath] = useState("/app");

  useEffect(() => {
    if (searchParams.get("login") === "required") {
      setNextPath(safeNextPath(searchParams.get("next")));
      setOpen(true);
    }
  }, [searchParams]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      router.replace("/");
    }
  }

  function handleLoginSuccess() {
    setOpen(false);
    router.push(nextPath);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        hideCloseButton
        overlayClassName={styles.overlay}
        className={styles.card}
      >
        <Image
          src="/landing/3d/login-key.webp"
          alt=""
          aria-hidden="true"
          width={132}
          height={132}
          className={styles.key}
        />
        <Image
          src="/landing/3d/star.webp"
          alt=""
          aria-hidden="true"
          width={54}
          height={54}
          className={styles.star}
        />
        <button
          type="button"
          onClick={() => handleOpenChange(false)}
          aria-label={t("auth.close")}
          className={styles.close}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <DialogTitle className={styles.title}>{t("auth.title")}</DialogTitle>
        <span className={styles.hand}>{t("auth.tagline")}</span>
        <DialogDescription className={styles.description}>
          {t("auth.body")}
        </DialogDescription>
        <GoogleLoginButton variant="landing" onSuccess={handleLoginSuccess} />
        <small className={styles.footnote}>{t("auth.footnote")}</small>
      </DialogContent>
    </Dialog>
  );
}
