export const formatCurrency = (value) => `£${value.toLocaleString()}`;
export const formatPercent = (value) => `${value.toFixed(1)}%`;

export const getChartTheme = (theme) => {
  const isDark = theme === "dark";
  return {
    isDark,
    axisColor: isDark ? "#fff" : "#666",
    gridColor: isDark ? "#555" : "#ccc",
    backgroundColor: isDark ? "#333" : "#fff",
    textColor: isDark ? "#fff" : "#333",
  };
};

export const getApexChartOptions = (theme, { isPercentage = false, xAxisTitle = "", yAxisTitle = "" } = {}) => {
  const { isDark, axisColor, gridColor, textColor } = getChartTheme(theme);

  return {
    chart: {
      type: "line",
      background: "transparent",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      zoom: {
        enabled: true,
        type: "xy",
        autoScaleYaxis: true,
      },
      animations: {
        enabled: false,
      },
    },
    theme: {
      mode: isDark ? "dark" : "light",
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    grid: {
      borderColor: gridColor,
      strokeDashArray: 3,
    },
    xaxis: {
      type: "numeric",
      labels: {
        style: {
          colors: axisColor,
          fontSize: "12px",
        },
        formatter: formatCurrency,
      },
      axisBorder: {
        color: axisColor,
      },
      axisTicks: {
        color: axisColor,
      },
      title: {
        text: xAxisTitle,
        style: {
          color: axisColor,
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: axisColor,
          fontSize: "12px",
        },
        formatter: isPercentage ? formatPercent : formatCurrency,
      },
      min: isPercentage ? 0 : undefined,
      max: isPercentage ? 100 : undefined,
      title: {
        text: yAxisTitle,
        style: {
          color: axisColor,
        },
      },
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      style: {
        fontSize: "11px",
      },
      x: {
        formatter: (value) => `Gross: ${formatCurrency(value)}`,
      },
      y: {
        formatter: (value) => (isPercentage ? formatPercent(value) : formatCurrency(value)),
      },
    },
    legend: {
      show: true,
      position: "bottom",
      fontSize: "12px",
      labels: {
        colors: textColor,
      },
      onItemClick: {
        toggleDataSeries: true,
      },
      onItemHover: {
        highlightDataSeries: true,
      },
    },
    markers: {
      size: 0,
    },
  };
};
