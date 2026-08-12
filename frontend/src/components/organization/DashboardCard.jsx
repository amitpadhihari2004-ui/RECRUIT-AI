import { TrendingUp } from "lucide-react";

function DashboardCard({
  title,
  value,
  icon: Icon,
  color = "bg-blue-600",
  growth = "",
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">

      {/* Header */}
      <div className="flex items-center justify-between">

        <div>
          <p className="text-gray-500 text-sm font-medium">
            {title}
          </p>

          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            {value}
          </h2>
        </div>

        <div
          className={`${color} w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg`}
        >
          {Icon && <Icon size={28} />}
        </div>

      </div>

      {/* Footer */}
      {growth && (
        <div className="flex items-center gap-2 mt-6">

          <TrendingUp
            size={18}
            className="text-green-600"
          />

          <span className="text-green-600 font-semibold">
            {growth}
          </span>

          <span className="text-gray-400 text-sm">
            this month
          </span>

        </div>
      )}

    </div>
  );
}

export default DashboardCard;