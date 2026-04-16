export default function AuthenticationForm() {
  return (
    <div className="space-y-3">

      <div className="flex items-center justify-between">
        <label>Two-Factor Authentication</label>
        <input type="checkbox" />
      </div>

      <div>
        <label className="text-sm">Password Policy</label>
        <select className="w-full border p-2 rounded mt-1">
          <option>Strong (12+ chars, special chars)</option>
          <option>Medium</option>
        </select>
      </div>

      <div>
        <label className="text-sm">Session Timeout (minutes)</label>
        <input className="w-full border p-2 rounded mt-1" />
      </div>

      <div>
        <label className="text-sm">Max Login Attempts</label>
        <input className="w-full border p-2 rounded mt-1" />
      </div>

    </div>
  );
}