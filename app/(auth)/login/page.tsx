"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useActionState, useEffect, useState } from "react";

import { SparklesIcon } from "@/components/chat/icons";
import { SubmitButton } from "@/components/chat/submit-button";
import { toast } from "@/components/chat/toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AuthForm } from "@/components/chat/auth-form";
import { type LoginActionState, login } from "../actions";

function ContactModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSent(true);
      } else {
        toast({ type: "error", description: "Verzenden mislukt. Probeer opnieuw." });
      }
    } catch {
      toast({ type: "error", description: "Er is een fout opgetreden." });
    } finally {
      setSending(false);
    }
  };

  const handleClose = (val: boolean) => {
    if (!val) setSent(false);
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contact opnemen</DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <SparklesIcon size={20} />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Bedankt voor uw bericht! We nemen zo snel mogelijk contact met u op.
            </p>
            <Button onClick={() => handleClose(false)} variant="outline">
              Sluiten
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact-name">Naam *</Label>
              <Input
                id="contact-name"
                name="name"
                placeholder="Uw volledige naam"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact-email">E-mailadres *</Label>
              <Input
                id="contact-email"
                name="email"
                type="email"
                placeholder="uw@email.nl"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact-phone">Telefoonnummer *</Label>
              <Input
                id="contact-phone"
                name="phone"
                placeholder="+31 6 12345678"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact-message">Bericht *</Label>
              <Textarea
                id="contact-message"
                name="message"
                placeholder="Hoe kunnen wij u helpen?"
                rows={4}
                required
              />
            </div>
            <Button type="submit" disabled={sending}>
              {sending ? "Verzenden..." : "Verstuur bericht"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Page() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    { status: "idle" }
  );

  const { update: updateSession } = useSession();

  // biome-ignore lint/correctness/useExhaustiveDependencies: router and updateSession are stable refs
  useEffect(() => {
    if (state.status === "failed") {
      toast({ type: "error", description: "Ongeldige gebruikersnaam of wachtwoord." });
    } else if (state.status === "invalid_data") {
      toast({
        type: "error",
        description: "Vul alle velden correct in.",
      });
    } else if (state.status === "success") {
      setIsSuccessful(true);
      updateSession();
      router.refresh();
    }
  }, [state.status]);

  const handleSubmit = (formData: FormData) => {
    setUsername(formData.get("email") as string);
    formAction(formData);
  };

  return (
    <>
      <div className="flex flex-col items-start gap-3 mb-2">
        <div className="flex size-9 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground ring-1 ring-border/50">
          <SparklesIcon size={14} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Chatbot</h1>
          <p className="text-sm text-muted-foreground">
            Log in om verder te gaan
          </p>
        </div>
      </div>

      <AuthForm action={handleSubmit} defaultEmail={username}>
        <SubmitButton isSuccessful={isSuccessful}>Inloggen</SubmitButton>
      </AuthForm>

      <div className="mt-4">
        <Button
          variant="outline"
          className="w-full border-primary/30 text-primary hover:bg-primary/5"
          onClick={() => setContactOpen(true)}
          type="button"
        >
          Contact opnemen
        </Button>
      </div>

      <ContactModal open={contactOpen} onOpenChange={setContactOpen} />
    </>
  );
}
