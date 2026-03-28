import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { getContactRequests } from "@/lib/db/queries";

async function AdminContent() {
  const requests = await getContactRequests();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Contactverzoeken
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {requests.length} verzoek{requests.length !== 1 ? "en" : ""} ontvangen
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-lg border border-border/50 bg-muted/20 p-12 text-center">
          <p className="text-muted-foreground">
            Nog geen contactverzoeken ontvangen.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Naam
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  E-mail
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Telefoon
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Bericht
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Datum
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, i) => (
                <tr
                  key={req.id}
                  className={
                    i % 2 === 0
                      ? "bg-background"
                      : "bg-muted/10"
                  }
                >
                  <td className="px-4 py-3 font-medium">{req.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <a
                      href={`mailto:${req.email}`}
                      className="hover:underline hover:text-foreground transition-colors"
                    >
                      {req.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {req.phone}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="truncate text-muted-foreground" title={req.message}>
                      {req.message}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {new Date(req.createdAt).toLocaleString("nl-NL", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <Suspense fallback={<div>Laden...</div>}>
        <AdminContent />
      </Suspense>
    </div>
  );
}
