import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(400).send("Invalid request");
  }

  // Overenie od PayPalu
  const params = new URLSearchParams({ cmd: "_notify-validate", ...req.body });

  const verify = await fetch("https://ipnpb.paypal.com/cgi-bin/webscr", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const verification = await verify.text();

  if (verification !== "VERIFIED") {
    return res.status(400).send("Invalid IPN");
  }

  // Dáta z PayPalu
  const paymentStatus = req.body.payment_status;
  const payerEmail = req.body.payer_email;
  const amount = req.body.mc_gross;

  if (paymentStatus === "Completed") {
    // Nastavenie mailu
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "clientpilot0@gmail.com",
        pass: "gptr beoy bnwn wgzx"
      }
    });

    // Odoslanie mailu
    await transporter.sendMail({
      from: "ClientPillot",
      to: "clientpilot0@gmail.com",
      subject: "Nová zaplatená objednávka",
      text: `Používateľ ${payerEmail} práve zaplatil ${amount}€ za tvoju službu.`
    });
  }

  return res.status(200).send("OK");
}
