import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const apiKey = req.headers["x-api-key"];

    if (!process.env.API_KEY || apiKey !== process.env.API_KEY) {
      return res.status(401).json({
        success: false,
        message: "Invalid API Key"
      });
    }

    const data = req.body ?? {};
    const {
      to_email,
      subject,
      body,
      sender_user,
      sender_pass,
      number,
      user_id,
      username
    } = data;

    if (!to_email || !subject || !body || !sender_user || !sender_pass) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: String(sender_user).trim(),
        pass: String(sender_pass)
      }
    });

    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"Appeal Service" <${String(sender_user).trim()}>`,
      to: String(to_email).trim(),
      subject: String(subject),
      html: String(body)
    });

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
      target: number ?? null,
      user_id: user_id ?? null,
      username: username ?? null
    });
  } catch (err) {
    console.error("send-gmail error:", err);

    return res.status(500).json({
      success: false,
      message: err?.message || "Internal server error"
    });
  }
}
