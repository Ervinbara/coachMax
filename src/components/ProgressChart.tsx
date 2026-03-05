import { VictoryArea, VictoryAxis, VictoryChart, VictoryLine, VictoryTheme } from "victory-native";

type ProgressChartPoint = {
  week: string;
  value: number;
};

type ProgressChartProps = {
  data: ProgressChartPoint[];
};

export const ProgressChart = ({ data }: ProgressChartProps) => (
  <VictoryChart
    height={220}
    padding={{ top: 20, bottom: 40, left: 40, right: 20 }}
    theme={VictoryTheme.material}
    style={{
      background: { fill: "transparent" },
    }}
  >
    <VictoryAxis
      style={{
        tickLabels: { fill: "#7B80A4", fontSize: 11, fontFamily: "monospace" },
        axis: { stroke: "#1D2040" },
        ticks: { stroke: "#1D2040" },
      }}
    />
    <VictoryAxis
      dependentAxis
      style={{
        tickLabels: { fill: "#7B80A4", fontSize: 11, fontFamily: "monospace" },
        axis: { stroke: "#1D2040" },
        grid: { stroke: "#1D2040", opacity: 0.6 },
      }}
    />
    <VictoryArea
      interpolation="natural"
      style={{ data: { fill: "rgba(56, 189, 248, 0.12)", strokeWidth: 0 } }}
      data={data}
      x="week"
      y="value"
    />
    <VictoryLine
      interpolation="natural"
      style={{ data: { stroke: "#38BDF8", strokeWidth: 2.5 } }}
      data={data}
      x="week"
      y="value"
    />
  </VictoryChart>
);
