export const formatCurrency = (value) => `£${value.toLocaleString()}`;
export const formatPercent = (value) => `${value.toFixed(1)}%`;

export const getChartTheme = (theme) => {
  const isDark = theme === "dark";
  return {
    isDark,
    axisColor: isDark ? "#fff" : "#666",
    gridColor: isDark ? "#555" : "#ccc",
  };
};

export const getTooltipStyle = (isDark) => ({
  contentStyle: {
    backgroundColor: isDark ? "#333" : "#fff",
    border: `1px solid ${isDark ? "#555" : "#ccc"}`,
    color: isDark ? "#fff" : "#333",
    fontSize: 11,
    padding: "4px 8px",
    maxHeight: 200,
    overflowY: "auto",
  },
  itemStyle: { padding: 0, margin: 0, lineHeight: 1.2 },
});

export const axisTickStyle = (axisColor) => ({
  fill: axisColor,
  fontSize: 12,
});

export const legendStyle = { fontSize: 12 };

export const chartMargin = { top: 5, right: 20, left: 10, bottom: 5 };
