import { useState, useEffect } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { adminService } from "../../services/api";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/outline";

export default function RevenueChart() {
  const [revenueData, setRevenueData] = useState([]);
  const [fullData, setFullData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPeriod, setCurrentPeriod] = useState(0);
  const [viewMode, setViewMode] = useState("week");

  const getPeriodLength = () => {
    switch (viewMode) {
      case "week":
        return 7;
      case "month":
        return 30;
      default:
        return 7;
    }
  };

  useEffect(() => {
    async function fetchRevenueData() {
      try {
        setLoading(true);
        const response = await adminService.getRevenueByDate();

        if (response && response.data && Array.isArray(response.data)) {
          const transactions = response.data;

          const processedPaymentIds = new Set();

          const dailyRevenue = {};

          transactions.forEach((transaction) => {
            if (transaction.status === "PAID" && transaction.payment) {
              if (processedPaymentIds.has(transaction.payment._id)) {
                return;
              }

              processedPaymentIds.add(transaction.payment._id);

              const createdAt = new Date(transaction.createdAt);
              const dateStr = createdAt.toISOString().split("T")[0];

              if (!dailyRevenue[dateStr]) {
                dailyRevenue[dateStr] = {
                  date: dateStr,
                  revenue: 0,
                  transactions: [],
                };
              }

              dailyRevenue[dateStr].revenue +=
                transaction.payment.totalPaid || 0;
              dailyRevenue[dateStr].transactions.push(transaction);
            }
          });

          ensureDateRange(dailyRevenue);

          const formattedData = Object.values(dailyRevenue).sort(
            (a, b) => new Date(a.date) - new Date(b.date)
          );

          setFullData(formattedData);
          updateDisplayedPeriod(formattedData, 0);
        }
      } catch (err) {
        console.error("Error fetching revenue data:", err);
        setError("Failed to load revenue data");
      } finally {
        setLoading(false);
      }
    }

    fetchRevenueData();
  }, []);

  useEffect(() => {
    if (fullData.length > 0) {
      updateDisplayedPeriod(fullData, 0);
    }
  }, [viewMode]);

  const ensureDateRange = (dailyData) => {
    if (Object.keys(dailyData).length === 0) return;

    const dates = Object.keys(dailyData).map((d) => new Date(d));
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    const currentDate = new Date(minDate);
    while (currentDate <= maxDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = {
          date: dateStr,
          revenue: 0,
          transactions: [],
        };
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  };

  const updateDisplayedPeriod = (data, periodIndex) => {
    if (!data || data.length === 0) {
      setRevenueData([]);
      return;
    }

    const daysPerPeriod = getPeriodLength();
    const totalPeriods = Math.ceil(data.length / daysPerPeriod);
    const validPeriodIndex = Math.max(
      0,
      Math.min(periodIndex, totalPeriods - 1)
    );
    const startIndex = validPeriodIndex * daysPerPeriod;
    const endIndex = Math.min(startIndex + daysPerPeriod, data.length);

    setRevenueData(data.slice(startIndex, endIndex));
    setCurrentPeriod(validPeriodIndex);
  };

  const handleNextPeriod = () => {
    const daysPerPeriod = getPeriodLength();
    const totalPeriods = Math.ceil(fullData.length / daysPerPeriod);
    if (currentPeriod < totalPeriods - 1) {
      updateDisplayedPeriod(fullData, currentPeriod + 1);
    }
  };

  const handlePrevPeriod = () => {
    if (currentPeriod > 0) {
      updateDisplayedPeriod(fullData, currentPeriod - 1);
    }
  };

  const handleViewModeChange = (e) => {
    setViewMode(e.target.value);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const getPeriodDateRange = () => {
    if (revenueData.length === 0) return "";

    const startDate = new Date(revenueData[0].date);
    const endDate = new Date(revenueData[revenueData.length - 1].date);

    const formatOptions = { year: "numeric", month: "short", day: "numeric" };
    return `${startDate.toLocaleDateString(
      undefined,
      formatOptions
    )} - ${endDate.toLocaleDateString(undefined, formatOptions)}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dayData = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-semibold">
            {new Date(label).toLocaleDateString()}
          </p>
          <p className="text-blue-600">
            Total Revenue: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-gray-500 text-xs">
            {dayData.transactions.length} payment(s)
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading)
    return <div className="p-4 text-center">Loading revenue data...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
  if (revenueData.length === 0)
    return (
      <div className="p-4 text-center text-gray-500">
        No revenue data available
      </div>
    );

  const isNextDisabled =
    currentPeriod >= Math.ceil(fullData.length / getPeriodLength()) - 1;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Revenue Overview</h2>
          <p className="text-sm text-gray-500">{getPeriodDateRange()}</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={viewMode}
            onChange={handleViewModeChange}
            className="py-1 px-3 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
          <div className="flex space-x-2">
            <button
              onClick={handlePrevPeriod}
              disabled={currentPeriod === 0}
              className={`p-2 rounded-full ${
                currentPeriod === 0
                  ? "text-gray-300"
                  : "text-blue-600 hover:bg-blue-100"
              }`}
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleNextPeriod}
              disabled={isNextDisabled}
              className={`p-2 rounded-full ${
                isNextDisabled
                  ? "text-gray-300"
                  : "text-blue-600 hover:bg-blue-100"
              }`}
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={revenueData}
            margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis
              tickFormatter={(value) => value.toLocaleString()}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 4 }}
              activeDot={{ r: 6, fill: "#1d4ed8" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>
          {viewMode === "week" && "Displaying revenue over a 7-day period"}
          {viewMode === "month" && "Displaying revenue over a 30-day period"}
        </p>
      </div>
    </div>
  );
}
