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
        tickLabels: { fill: "#A8A49E", fontSize: 11, fontFamily: "monospace" },
        axis: { stroke: "#E5E3DE" },
        ticks: { stroke: "#E5E3DE" },
      }}
    />
    <VictoryAxis
      dependentAxis
      style={{
        tickLabels: { fill: "#A8A49E", fontSize: 11, fontFamily: "monospace" },
        axis: { stroke: "#E5E3DE" },
        grid: { stroke: "#E5E3DE", opacity: 0.6 },
      }}
    />
    <VictoryArea
      interpolation="natural"
      style={{ data: { fill: "rgba(14, 165, 233, 0.12)", strokeWidth: 0 } }}
      data={data}
      x="week"
      y="value"
    />
    <VictoryLine
      interpolation="natural"
      style={{ data: { stroke: "#0EA5E9", strokeWidth: 2.5 } }}
      data={data}
      x="week"
      y="value"
    />
  </VictoryChart>
);
