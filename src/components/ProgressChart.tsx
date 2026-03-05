import { VictoryAxis, VictoryChart, VictoryLine, VictoryTheme } from "victory-native";

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
        tickLabels: { fill: "#9AA6C5", fontSize: 10 },
        axis: { stroke: "#2B3655" },
        ticks: { stroke: "#2B3655" },
      }}
    />
    <VictoryAxis
      dependentAxis
      style={{
        tickLabels: { fill: "#9AA6C5", fontSize: 10 },
        axis: { stroke: "#2B3655" },
        grid: { stroke: "#1A2237" },
      }}
    />
    <VictoryLine
      interpolation="natural"
      style={{ data: { stroke: "#42D392", strokeWidth: 3 } }}
      data={data}
      x="week"
      y="value"
    />
  </VictoryChart>
);
