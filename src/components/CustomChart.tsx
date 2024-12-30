import { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import { ReactorsType } from "../types/ReactorsType.type";
import { TemperatureType } from "../types/TemperatureType";
import { TempUnit } from "../types/TempUnit";
export default function CustomChart(props: {
  avgTemperature: any;
  setAvgTemperature: any;
  reactors: ReactorsType | null;
  setReactors: React.Dispatch<React.SetStateAction<ReactorsType | null>>;
  temperatureUnit: TempUnit | null;
  setTemperatureUnit: React.Dispatch<React.SetStateAction<TempUnit | null>>;
}) {
  const ctx = useRef(null);
  const [reactorsTemperatures, setReactorsTemperatures] = useState<
    TemperatureType[]
  >([]);

  useEffect(() => {
    const intervalId: number = setInterval(async () => {
      async function fetchReactors() {
        const rawResponse = await fetch(
          "https://nuclear.dacoder.io/reactors?apiKey=1bb4dff552124f3c"
        );
        const parsedResponse = await rawResponse.json();
        props.setReactors(parsedResponse);
      }
      await fetchReactors();

      async function fetchReactorsTemperature() {
        if (props.reactors && props.reactors.reactors.length > 0) {
          // Create a new array to store all temperatures
          const newTemperatures = [];

          // Fetch temperature for each reactor
          for (const reactor of props.reactors.reactors) {
            const rawResponse = await fetch(
              `https://nuclear.dacoder.io/reactors/temperature/${reactor.id}?apiKey=1bb4dff552124f3c`
            );
            const parsedResponse = await rawResponse.json();
            newTemperatures.push(parsedResponse.temperature);
          }

          // Update state with all new temperatures
          setReactorsTemperatures(newTemperatures);
          //   console.log(newTemperatures);
          props.setTemperatureUnit(newTemperatures[0].unit);
        }
      }

      await fetchReactorsTemperature();

      let sum = 0;
      reactorsTemperatures.map((temperature) => {
        sum = sum + temperature.amount;
      });
      if (reactorsTemperatures.length > 0) {
        const average = sum / reactorsTemperatures.length;
        props.setAvgTemperature((prevTemps: any) =>
          [...prevTemps, average].slice(-300)
        );
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [props.reactors]);

  //   console.log("temperature is ", reactorsTemperatures);

  useEffect(() => {
    let chart = undefined;
    if (ctx.current !== null) {
      chart = new Chart(ctx.current, {
        type: "line",
        data: {
          labels: props.avgTemperature.map((_: any, index: number) => {
            return `${index * 1}s`; // Add 's' to denote seconds
          }),
          datasets: [
            {
              label: "Average Temperature",
              data: props.avgTemperature,
              borderWidth: 1,
            },
          ],
        },
        options: {
          animation: { duration: 0 },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
      chart?.update();
    }
    return () => {
      if (chart !== undefined) {
        chart.destroy();
      }
    };
  }, [props.avgTemperature]);

  return <canvas ref={ctx}> </canvas>;
}
