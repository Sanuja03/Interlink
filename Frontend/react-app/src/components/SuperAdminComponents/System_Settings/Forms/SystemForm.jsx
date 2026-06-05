export default function SystemForm() {
  return (
    <div className="space-y-3">

      <div>
        <label className="text-sm">System Time Zone</label>
        <select className="w-full border p-2 rounded mt-1">
          <option>GMT +5:30 (Sri Lanka)</option>
          <option>UTC</option>
        </select>
      </div>

      <div>
        <label className="text-sm">Log Level</label>
        <select className="w-full border p-2 rounded mt-1">
          <option>Info</option>
          <option>Debug</option>
          <option>Error</option>
        </select>
      </div>

      <div>
        <label className="text-sm">Cache Expiration (hours)</label>
        <input className="w-full border p-2 rounded mt-1" placeholder="e.g. 24" />
      </div>

      <div className="flex items-center justify-between">
        <label>Maintenance Mode</label>
        <input type="checkbox" />
      </div>

    </div>
  );
}