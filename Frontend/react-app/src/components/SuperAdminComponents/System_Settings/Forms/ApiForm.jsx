export default function ApiForm() {
  return (
    <div className="space-y-3">

      <div>
        <label className="text-sm">API Rate Limit</label>
        <input className="w-full border p-2 rounded mt-1" placeholder="e.g. 1000 req/min" />
      </div>

      <div>
        <label className="text-sm">API Key</label>
        <input className="w-full border p-2 rounded mt-1" placeholder="************" />
      </div>

      <div>
        <label className="text-sm">Webhook URL</label>
        <input className="w-full border p-2 rounded mt-1" placeholder="https://example.com/webhook" />
      </div>

      <div className="flex items-center justify-between">
        <label>Enable API Access</label>
        <input type="checkbox" />
      </div>

    </div>
  );
}