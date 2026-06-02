package syncX.common.util;

import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

public class InterLinkMailSender {

    // Replace with YOUR Gmail + App Password
    private static final String SMTP_SERVER = "smtp.gmail.com";
    private static final int PORT = 465;
    private static final String SENDER_EMAIL = "interlink074@gmail.com";
    private static final String SENDER_PASSWORD = "odluwzhfquizaefu";

    // ── Send OTP html design will be created for signup verification ──
    public static void sendSignupOTP(String recipient, String otp) {
        String subject = "InterLink | Verify Your Email";

        String html =
                "<!DOCTYPE html><html><head><meta charset='UTF-8'/>" +
                        "<meta name='viewport' content='width=device-width, initial-scale=1.0'/>" +
                        "</head><body style='margin:0; padding:0; font-family:Segoe UI, Tahoma, Arial, sans-serif; background:#f5f7fb;'>" +
                        "<div style='max-width:600px; margin:0 auto; padding:24px;'>" +
                        "<div style='background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 16px 40px rgba(0,0,0,0.08);'>" +

                        // Header
                        "<div style='padding:30px 20px; background:linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); text-align:center;'>" +
                        "<div style='font-size:28px; font-weight:800; color:#ffffff; letter-spacing:1px;'>InterLink</div>" +
                        "<div style='color:#a0aec0; margin-top:6px;'>Connecting Talent with Opportunity</div>" +
                        "</div>" +

                        // Title
                        "<div style='padding:30px 20px 10px; text-align:center;'>" +
                        "<div style='font-size:20px; font-weight:700; color:#333;'>Verify Your Email Address</div>" +
                        "<div style='width:60px; height:4px; background:linear-gradient(90deg, #667eea, #764ba2); margin:12px auto; border-radius:2px;'></div>" +
                        "</div>" +

                        // OTP
                        "<div style='padding:20px 40px; text-align:center;'>" +
                        "<p style='color:#555; font-size:16px;'>Use the code below to complete your signup:</p>" +
                        "<div style='margin:20px 0;'>" +
                        "<span style='background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:#fff; font-size:36px; " +
                        "font-weight:700; letter-spacing:8px; padding:16px 30px; border-radius:12px; display:inline-block; " +
                        "box-shadow:0 8px 20px rgba(102,126,234,0.4);'>" + otp + "</span>" +
                        "</div>" +
                        "<p style='color:#888; font-size:14px;'>This code expires in <b>5 minutes</b></p>" +
                        "</div>" +

                        // Footer
                        "<div style='padding:20px; text-align:center; color:#6b7280; font-size:13px; border-top:1px solid #eee;'>" +
                        "If you didn't request this, you can safely ignore this email.<br/>" +
                        "<b>InterLink Team</b></div>" +

                        "</div></div></body></html>";

        sendHtmlEmailInternal(recipient, subject, html);
    }

    // ── Send OTP for forgot password html will be created ──
    public static void sendPasswordResetOTP(String recipient, String otp) {
        String subject = "InterLink | Password Reset Code";

        String html =
                "<!DOCTYPE html><html><head><meta charset='UTF-8'/>" +
                        "<meta name='viewport' content='width=device-width, initial-scale=1.0'/>" +
                        "</head><body style='margin:0; padding:0; font-family:Segoe UI, Tahoma, Arial, sans-serif; background:#f5f7fb;'>" +
                        "<div style='max-width:600px; margin:0 auto; padding:24px;'>" +
                        "<div style='background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 16px 40px rgba(0,0,0,0.08);'>" +

                        "<div style='padding:30px 20px; background:linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); text-align:center;'>" +
                        "<div style='font-size:28px; font-weight:800; color:#ffffff; letter-spacing:1px;'>InterLink</div>" +
                        "<div style='color:#a0aec0; margin-top:6px;'>Password Reset Request</div>" +
                        "</div>" +

                        "<div style='padding:30px 20px 10px; text-align:center;'>" +
                        "<div style='font-size:20px; font-weight:700; color:#333;'>Reset Your Password</div>" +
                        "<div style='width:60px; height:4px; background:linear-gradient(90deg, #667eea, #764ba2); margin:12px auto; border-radius:2px;'></div>" +
                        "</div>" +

                        "<div style='padding:20px 40px; text-align:center;'>" +
                        "<p style='color:#555; font-size:16px;'>Use the code below to reset your password:</p>" +
                        "<div style='margin:20px 0;'>" +
                        "<span style='background:linear-gradient(135deg, #e53e3e 0%, #c53030 100%); color:#fff; font-size:36px; " +
                        "font-weight:700; letter-spacing:8px; padding:16px 30px; border-radius:12px; display:inline-block; " +
                        "box-shadow:0 8px 20px rgba(229,62,62,0.4);'>" + otp + "</span>" +
                        "</div>" +
                        "<p style='color:#888; font-size:14px;'>This code expires in <b>5 minutes</b></p>" +
                        "</div>" +

                        "<div style='padding:20px; text-align:center; color:#6b7280; font-size:13px; border-top:1px solid #eee;'>" +
                        "If you didn't request this, someone may have entered your email by mistake. You can safely ignore this.<br/>" +
                        "<b>InterLink Team</b></div>" +

                        "</div></div></body></html>";

        sendHtmlEmailInternal(recipient, subject, html);
    }

    // ── Internal SMTP sender ──
    private static void sendHtmlEmailInternal(String recipient, String subject, String htmlBody) {
        try {
            SSLSocketFactory factory = (SSLSocketFactory) SSLSocketFactory.getDefault();
            SSLSocket socket = (SSLSocket) factory.createSocket(SMTP_SERVER, PORT);

            BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
            BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream(), StandardCharsets.UTF_8));

            readResponse(reader);
            sendCommand(writer, "EHLO localhost");
            readResponse(reader);

            sendCommand(writer, "AUTH LOGIN");
            readResponse(reader);

            sendCommand(writer, Base64.getEncoder().encodeToString(SENDER_EMAIL.getBytes(StandardCharsets.UTF_8)));
            readResponse(reader);

            sendCommand(writer, Base64.getEncoder().encodeToString(SENDER_PASSWORD.getBytes(StandardCharsets.UTF_8)));
            readResponse(reader);

            sendCommand(writer, "MAIL FROM:<" + SENDER_EMAIL + ">");
            readResponse(reader);

            sendCommand(writer, "RCPT TO:<" + recipient + ">");
            readResponse(reader);

            sendCommand(writer, "DATA");
            readResponse(reader);

            writer.write("Subject: " + subject + "\r\n");
            writer.write("From: InterLink <" + SENDER_EMAIL + ">\r\n");
            writer.write("To: " + recipient + "\r\n");
            writer.write("MIME-Version: 1.0\r\n");
            writer.write("Content-Type: text/html; charset=UTF-8\r\n");
            writer.write("\r\n");
            writer.write(htmlBody);
            writer.write("\r\n.\r\n");
            writer.flush();

            readResponse(reader);
            sendCommand(writer, "QUIT");
            readResponse(reader);

            socket.close();
            System.out.println("[InterLinkMail] Email sent to " + recipient);
        } catch (Exception e) {
            System.err.println("[InterLinkMail] Failed to send email to " + recipient);
            e.printStackTrace();
        }
    }

    private static void sendCommand(BufferedWriter writer, String command) throws IOException {
        writer.write(command + "\r\n");
        writer.flush();
    }

    private static void readResponse(BufferedReader reader) throws IOException {
        String line;
        while ((line = reader.readLine()) != null) {
            if (line.length() < 4 || line.charAt(3) != '-') break;
        }
    }
}