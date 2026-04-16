export default function StorageForm() {
  return (
    <div className="space-y-3">

      <div>
        <label className="text-sm">Storage Provider</label>
        <select className="w-full border p-2 rounded mt-1">
          <option>AWS S3</option>
          <option>Google Cloud</option>
          <option>Local Storage</option>
        </select>
      </div>

      <div>
        <label className="text-sm">Max File Upload Size (MB)</label>
        <input className="w-full border p-2 rounded mt-1" placeholder="e.g. 50" />
      </div>

      <div>
        <label className="text-sm">Allowed File Types</label>
        <input className="w-full border p-2 rounded mt-1" placeholder=".pdf, .docx, .jpg" />
      </div>

      <div>
        <label className="text-sm">Retention Period (days)</label>
        <input className="w-full border p-2 rounded mt-1" placeholder="e.g. 30" />
      </div>

    </div>
  );
}