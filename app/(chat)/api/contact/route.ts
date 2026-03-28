import { Resend } from "resend";
import { z } from "zod";
import { createContactRequest } from "@/lib/db/queries";

const resend = new Resend(process.env.RESEND_API_KEY);

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  message: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = contactSchema.parse(body);

    // Sla op in database
    await createContactRequest(data);

    // Stuur e-mail via Resend
    const contactEmail = process.env.CONTACT_EMAIL;
    if (contactEmail && process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "Chatbot Contact <onboarding@resend.dev>",
        to: contactEmail,
        subject: `Nieuw contactverzoek van ${data.name}`,
        text: [
          `Naam: ${data.name}`,
          `E-mail: ${data.email}`,
          `Telefoon: ${data.phone}`,
          ``,
          `Bericht:`,
          data.message,
        ].join("\n"),
      });
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Ongeldige invoer" }, { status: 400 });
    }
    console.error("Contact API error:", error);
    return Response.json({ error: "Interne fout" }, { status: 500 });
  }
}
