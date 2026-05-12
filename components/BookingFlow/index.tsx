"use client";

import { useEffect, useState } from "react";
import { BookingState } from "./types";
import type { BookingDict } from "./dict";
import { loadAuth } from "./utils/auth";
import { useBookingToken } from "@/components/BookingTokenProvider";
import BookingNavbar from "./shared/BookingNavbar";
import Step1DateGuests from "./steps/Step1DateGuests";
import Step2Services from "./steps/Step2Services";
import Step3Packages from "./steps/Step3Packages";
import Step4Location from "./steps/Step4Location";
import Step5Contact from "./steps/Step5Contact";
import Step6Summary from "./steps/Step6Summary";
import Step7Confirmation from "./steps/Step7Confirmation";

interface BookingFlowProps {
  locale: string;
  dict: BookingDict;
}

const STORAGE_KEY = "lecercle_booking_flow";

const INITIAL_STATE: BookingState = {
  date: null,
  guests: 1,
  selectedServices: [],
  selectedPackages: {},
  guestsPerService: {},
  city: "",
  address: "",
  postalCode: "",
  venueName: "",
  latitude: null,
  longitude: null,
  distanceKm: null,
  startTime: "",
  notes: "",
  contactType: "person",
  companyName: "",
  idno: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "+373",
  paymentOption: "now",
  smsSent: false,
  smsVerified: false,
  emailVerified: false,
  userAccessToken: "",
  userRefreshToken: "",
  userId: "",
  customerId: "",
  bookingRef: "",
};

function loadSaved(): { step: number; state: BookingState } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Step 7 = pay-later confirmed — user finished, start fresh next time
    if (parsed.step === 7) return null;
    const d = parsed.state?.date;
    return {
      step: parsed.step ?? 1,
      state: {
        ...INITIAL_STATE,
        ...parsed.state,
        date: d ? new Date(d.y, d.m, d.d) : null,
      },
    };
  } catch {
    return null;
  }
}

function getInitialFlow(): { step: number; state: BookingState } {
  const saved = loadSaved();
  const authResult = loadAuth();

  if (saved) {
    if (authResult) {
      const { auth } = authResult;
      // Keep booking progress from the session but always overlay the logged-in
      // user's contact details and fresh tokens so stale session data never wins.
      return {
        step: saved.step,
        state: {
          ...saved.state,
          email: auth.user.email ?? "",
          phone: auth.user.phoneNumber ?? saved.state.phone,
          firstName: auth.user.firstName || saved.state.firstName,
          lastName: auth.user.lastName || saved.state.lastName,
          companyName: auth.user.companyName ?? "",
          idno: auth.user.idno ?? "",
          contactType: auth.user.isCompany ? "company" : "person",
          emailVerified: !!auth.user.email,
          smsVerified: !!auth.user.phoneNumber,
          userAccessToken: auth.accessToken,
          userRefreshToken: auth.refreshToken,
          userId: auth.user.userId,
          customerId: auth.user.customerId,
        },
      };
    }
    return saved;
  }

  // No saved flow — pre-fill from auth profile
  if (authResult) {
    const { auth, tokensValid } = authResult;
    return {
      step: 1,
      state: {
        ...INITIAL_STATE,
        ...(tokensValid && {
          userAccessToken: auth.accessToken,
          userRefreshToken: auth.refreshToken,
          userId: auth.user.userId,
          customerId: auth.user.customerId,
          emailVerified: !!auth.user.email,
          smsVerified: !!auth.user.phoneNumber,
        }),
        email: auth.user.email ?? "",
        phone: auth.user.phoneNumber ?? "+373",
        firstName: auth.user.firstName,
        lastName: auth.user.lastName,
        companyName: auth.user.companyName ?? "",
        idno: auth.user.idno ?? "",
        contactType: auth.user.isCompany ? "company" : "person",
      },
    };
  }

  return { step: 1, state: INITIAL_STATE };
}

function saveFlow(step: number, state: BookingState) {
  try {
    const d = state.date;
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        step,
        state: {
          ...state,
          date: d ? { y: d.getFullYear(), m: d.getMonth(), d: d.getDate() } : null,
        },
      })
    );
  } catch {}
}

function stepLabel(dict: BookingDict, current: number, total = 6): string {
  return dict.step_label
    .replace("{current}", String(current))
    .replace("{total}", String(total));
}

export default function BookingFlow({ locale, dict }: BookingFlowProps) {
  const [step, setStep] = useState(() => getInitialFlow().step);
  const [state, setState] = useState<BookingState>(() => getInitialFlow().state);
  const { tokenRef, error: tokenError } = useBookingToken();

  useEffect(() => {
    saveFlow(step, state);
  }, [step, state]);

  function patch(update: Partial<BookingState>) {
    setState((prev) => ({ ...prev, ...update }));
  }

  function goNext() {
    setStep((s) => Math.min(s + 1, 7));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const commonProps = { state, onChange: patch, onNext: goNext, onBack: goBack, dict, locale };

  return (
    <div className="flex flex-col min-h-svh bg-[#0d0d0d]">
      <BookingNavbar locale={locale} />
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-lg">
          {tokenError && (
            <div className="mb-6 px-4 py-3 border border-red-500/40 bg-red-500/10 text-red-400 text-sm font-figtree tracking-tight">
              Service unavailable. Please refresh the page or try again later.
            </div>
          )}
          {step === 1 && (
            <Step1DateGuests
              state={state}
              onChange={patch}
              onNext={goNext}
              dict={dict}
              stepLabel={stepLabel(dict, 1)}
            />
          )}
          {step === 2 && (
            <Step2Services
              {...commonProps}
              stepLabel={stepLabel(dict, 2)}
              tokenRef={tokenRef}
            />
          )}
          {step === 3 && (
            <Step3Packages
              {...commonProps}
              stepLabel={stepLabel(dict, 3)}
              tokenRef={tokenRef}
            />
          )}
          {step === 4 && (
            <Step4Location
              {...commonProps}
              stepLabel={stepLabel(dict, 4)}
            />
          )}
          {step === 5 && (
            <Step5Contact
              {...commonProps}
              stepLabel={stepLabel(dict, 5)}
              tokenRef={tokenRef}
            />
          )}
          {step === 6 && (
            <Step6Summary
              {...commonProps}
              stepLabel={stepLabel(dict, 6)}
            />
          )}
          {step === 7 && (
            <Step7Confirmation
              state={state}
              dict={dict}
              locale={locale}
              onBack={goBack}
            />
          )}
        </div>
      </main>
    </div>
  );
}
