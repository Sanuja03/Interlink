export default function CommunicationForm() {
  return (
    <div className="space-y-3">

      <div>
        <label className="text-sm">SMTP Server</label>
        <input className="w-full border p-2 rounded mt-1" placeholder="smtp.mail.com" />
      </div>

      <div>
        <label className="text-sm">SMTP Port</label>
        <input className="w-full border p-2 rounded mt-1" placeholder="587" />
      </div>

      <div>
        <label className="text-sm">Sender Email Address</label>
        <input className="w-full border p-2 rounded mt-1" placeholder="noreply@company.com" />
      </div>

      <div className="flex items-center justify-between">
        <label>Email Notifications</label>
        <input type="checkbox" />
      </div>

      <div className="flex items-center justify-between">
        <label>SMS Notifications</label>
        <input type="checkbox" />
      </div>

    </div>
  );
}