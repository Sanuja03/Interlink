export default function SystemSettingsCard({ title, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 rounded-xl
                 bg-[#24698B]/10 border border-[#DADEE0]
                 cursor-pointer hover:bg-[#24698B]/20 transition"
    >
      <span className="font-medium">{title}</span>

      <span className="text-[#24698B]">→</span>
    </div>
  );
}