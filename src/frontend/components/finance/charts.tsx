"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const GRID = "var(--fc-chart-grid)";
const AXIS = "var(--fc-muted)";

const tooltipStyle = {
  background: "var(--fc-surface)",
  border: "1px solid var(--fc-border)",
  borderRadius: 10,
  boxShadow: "var(--fc-shadow-md)",
  color: "var(--fc-text)",
  fontSize: 12,
};

export function ScoreTrendChart({
  data,
  height = 250,
}: {
  data: { month: string; score: number }[];
  height?: number;
}) {
  return (
    <>
      <div className="fc-chart" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID} strokeDasharray="3 4" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              domain={[700, 820]}
              tick={{ fill: AXIS, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value} / 900`, "Score"]} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#2563EB"
              strokeWidth={2.5}
              fill="url(#scoreArea)"
              dot={{ r: 3, fill: "#2563EB", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <details className="fc-chart-table">
        <summary>View chart data</summary>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Illustrative score</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.month}>
                <td>{item.month}</td>
                <td>{item.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </>
  );
}

export function PaymentActivityChart({
  data,
  height = 260,
}: {
  data: { month: string; onTime: number; late: number; pending: number }[];
  height?: number;
}) {
  return (
    <>
      <div className="fc-chart" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 4" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 12, color: AXIS }} />
            <Bar dataKey="onTime" name="On time" stackId="a" fill="#16A34A" radius={[0, 0, 2, 2]} />
            <Bar dataKey="late" name="Late" stackId="a" fill="#F59E0B" />
            <Bar dataKey="pending" name="Upcoming / pending" stackId="a" fill="#94A3B8" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <details className="fc-chart-table">
        <summary>View chart data</summary>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>On time</th>
              <th>Late</th>
              <th>Pending</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.month}>
                <td>{item.month}</td>
                <td>{item.onTime}</td>
                <td>{item.late}</td>
                <td>{item.pending}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </>
  );
}

export function CategoryDonut({
  data,
  height = 250,
}: {
  data: { name: string; value: number; color: string }[];
  height?: number;
}) {
  return (
    <>
      <div className="fc-chart fc-donut" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={3}
              stroke="var(--fc-surface)"
              strokeWidth={2}
            >
              {data.map((item) => (
                <Cell key={item.name} fill={item.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="fc-donut-center">
          <strong>6</strong>
          <span>categories</span>
        </div>
      </div>
      <ul className="fc-legend-list">
        {data.map((item) => (
          <li key={item.name}>
            <span className="fc-legend-dot" style={{ background: item.color }} />
            <span>{item.name}</span>
            <strong>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(item.value)}</strong>
          </li>
        ))}
      </ul>
    </>
  );
}

export function ScoreDistributionChart({
  data,
  height = 240,
}: {
  data: { band: string; count: number }[];
  height?: number;
}) {
  return (
    <>
      <div className="fc-chart" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 12, bottom: 4 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 4" horizontal={false} />
            <XAxis type="number" tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              dataKey="band"
              type="category"
              width={78}
              tick={{ fill: AXIS, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="count" name="Applicants" fill="#2563EB" radius={[0, 5, 5, 0]} barSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <details className="fc-chart-table">
        <summary>View chart data</summary>
        <table>
          <thead>
            <tr>
              <th>Score band</th>
              <th>Applicants</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.band}>
                <td>{item.band}</td>
                <td>{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </>
  );
}

export function ApplicantVolumeChart({
  data,
  height = 240,
}: {
  data: { month: string; applicants: number; assessments: number }[];
  height?: number;
}) {
  return (
    <>
      <div className="fc-chart" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 12, left: -24, bottom: 0 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 4" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 12, color: AXIS }} />
            <Line type="monotone" dataKey="applicants" name="Authorized applicants" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="assessments" name="Assessments" stroke="#16A34A" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <details className="fc-chart-table">
        <summary>View chart data</summary>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Applicants</th>
              <th>Assessments</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.month}>
                <td>{item.month}</td>
                <td>{item.applicants}</td>
                <td>{item.assessments}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </>
  );
}
