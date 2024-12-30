import { useEffect, useState } from "react";
import CustomChart from "../components/CustomChart";
import ReactorCard from "../components/ReactorCard";
import { ReactorsType } from "../types/ReactorsType.type";
import { TempUnit } from "../types/TempUnit";
import { ReactorType } from "../types/ReactorType";
import { Box, Button, Typography } from "@mui/material";
import { SystemLogs } from "../components/SystemLogs";

export default function Dashboard() {
  const [reactors, setReactors] = useState<ReactorsType | null>(null);
  const [avgTemperature, setAvgTemperature] = useState<number[]>([]);
  const [temperatureUnit, setTemperatureUnit] = useState<TempUnit | null>(null);
  const [totalPower, setTotalPower] = useState<number>(0);
  const [reactor, setReactor] = useState<ReactorType | null>(null);
  const [activeReactors, setActiveReactorse] = useState<number>(0);

  const handleGlobalReset = async () => {
    try {
      const response = await fetch(
        "https://nuclear.dacoder.io/reactors/reset?apiKey=1bb4dff552124f3c",
        {
          method: "POST",
        }
      );

      if (response.ok) {
        // Check for 201 status code
        if (response.status === 201) {
          console.log("Reactors reset successfully");
        }
      } else {
        // Handle error cases
        console.error("Reset failed with status:", response.status);
      }
    } catch (error) {
      console.error("Error during reactor reset:", error);
    }
  };

  const handleGlobalControlledShutdown = async () => {
    try {
      if (!reactors) return;

      let successCount = 0;

      for (const reactor of reactors.reactors) {
        const url = `https://nuclear.dacoder.io/reactors/controlled-shutdown/${reactor.id}?apiKey=1bb4dff552124f3c`;
        const response = await fetch(url, { method: "POST" });

        console.log(`Response status for ${reactor.name}:`, response.status);

        if (response.status === 201) successCount++;
      }

      console.log(
        `Global controlled shutdown completed. ${successCount}/${reactors.reactors.length} reactors successfully shut down.`
      );
    } catch (err) {
      console.error("Error during controlled shutdown:", err);
    }
  };

  const handleGlobalEmergencyShutdown = async () => {
    try {
      if (!reactors) return;

      let successCount = 0;

      for (const reactor of reactors.reactors) {
        const url = `https://nuclear.dacoder.io/reactors/emergency-shutdown/${reactor.id}?apiKey=1bb4dff552124f3c`;
        const response = await fetch(url, { method: "POST" });

        console.log(`Response status for ${reactor.name}:`, response.status);

        if (response.status === 201) successCount++;
      }

      console.log(
        `Global emergency shutdown completed. ${successCount}/${reactors.reactors.length} reactors successfully shut down.`
      );
    } catch (err) {
      console.error("Error during emergency shutdown:", err);
    }
  };

  useEffect(() => {
    const intervalId: number = setInterval(async () => {
      async function fetchReactorsOutput() {
        if (reactors && reactors.reactors.length > 0) {
          const outputs = [];

          for (const reactor of reactors.reactors) {
            const rawResponse = await fetch(
              `https://nuclear.dacoder.io/reactors/output/${reactor.id}?apiKey=1bb4dff552124f3c`
            );
            const parsedResponse = await rawResponse.json();
            outputs.push(parsedResponse.output.amount);
          }

          setTotalPower(outputs.reduce((acc, amount) => acc + amount, 0));
        }
      }

      await fetchReactorsOutput();

      async function fetchReactorState() {
        if (reactors && reactors.reactors.length > 0) {
          let count = 0;

          for (const reactor of reactors.reactors) {
            const rawResponse = await fetch(
              `https://nuclear.dacoder.io/reactors/reactor-state/${reactor.id}?apiKey=1bb4dff552124f3c`
            );
            const parsedResponse = await rawResponse.json();
            if (parsedResponse.state === "Active") {
              count++;
            }
          }

          setActiveReactorse(count);
        }
      }

      await fetchReactorState();
    }, 1000);

    return () => clearInterval(intervalId);
  }, [reactors, totalPower]);

  return (
    <Box
      sx={{
        overflowAnchor: "none",
      }}
    >
      <Box
        sx={{
          width: "100vw",
          backgroundColor: "var(--dark-blue)",
          paddingBottom: "80px",
        }}
      >
        <Typography
          component="h1"
          sx={{
            margin: 0,
            marginLeft: "10px",
            color: "var(--white)",
            padding: "10px",
            fontSize: "2em",
            fontWeight: "bold",
          }}
        >
          Nuclear Power Facility
        </Typography>
        <Typography
          sx={{
            color: "var(--white)",
            margin: 0,
            marginLeft: "10px",

            padding: "10px",
            paddingTop: 0,
            paddingBottom: 0,
            fontSize: "1em",
          }}
        >
          Global Average Temperature:{" "}
          {avgTemperature.length
            ? avgTemperature[avgTemperature.length - 1].toFixed(2)
            : 0.0}{" "}
          {temperatureUnit}
        </Typography>
        <Typography
          sx={{
            color: "var(--white)",
            margin: 0,
            marginLeft: "10px",
            padding: "10px",
            paddingTop: 0,
            paddingBottom: 0,
            fontSize: "1em",
          }}
        >
          Total Power: {totalPower.toFixed(2)} mw
        </Typography>
        <Typography
          sx={{
            color: "var(--white)",
            margin: 0,
            marginLeft: "10px",

            padding: "10px",
            paddingTop: 0,
            paddingBottom: 0,
            marginBottom: "20px",
            fontSize: "1em",
          }}
        >
          Active Reactors: {activeReactors} /{" "}
          {reactors ? reactors.reactors.length : 0}
        </Typography>

        <Button
          sx={{
            margin: "20px",
            marginTop: 0,
            fontSize: "1em",
            backgroundColor: "var(--red)",
          }}
          onClick={handleGlobalReset}
          variant="contained"
        >
          Global Reset
        </Button>

        <Box
          sx={{
            width: "100vw",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: "80vw",
              backgroundColor: "var(--white)",
            }}
          >
            <CustomChart
              avgTemperature={avgTemperature}
              setAvgTemperature={setAvgTemperature}
              reactors={reactors}
              setReactors={setReactors}
              temperatureUnit={temperatureUnit}
              setTemperatureUnit={setTemperatureUnit}
            />
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "60vw",
            margin: "0 auto",
            flexWrap: "wrap",
            marginTop: "20px",
            gap: "40px",
          }}
        >
          <Button
            sx={{
              backgroundColor: "var(--green)",
              color: "var(--dark-blue)",
              fontWeight: "bold",
              minWidth: "113px",
              maxWidth: "214px",
              borderRadius: "10px",
            }}
            variant="contained"
            onClick={handleGlobalControlledShutdown}
          >
            Controlled Shutdown
          </Button>

          <Button
            sx={{
              backgroundColor: "var(--red)",
              color: "var(--white)",
              fontWeight: "bold",
              minWidth: "113px",
              maxWidth: "214px",
              borderRadius: "10px",
            }}
            variant="contained"
            onClick={handleGlobalEmergencyShutdown}
          >
            Emergency Shutdown
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          width: "95vw",
          backgroundColor: "var(--light-blue)",
          margin: "20px auto",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "grid",
              maxWidth: "90vw",
              gridGap: "10px",
              gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
            }}
          >
            {reactors &&
              reactors.reactors.map((reactor: ReactorType) => (
                <Box key={reactor.id}>
                  <Typography
                    component="h2"
                    sx={{
                      color: "var(--dark-blue)",
                      margin: "10px 0 0 0",
                      textAlign: "center",
                      fontSize: "1.5em",
                      fontWeight: "bold",
                    }}
                  >
                    {reactor.name}
                  </Typography>
                  <ReactorCard
                    reactor={reactor}
                    temperatureUnit={temperatureUnit}
                  />
                </Box>
              ))}
          </Box>
        </Box>
      </Box>
      <Typography
        component="h1"
        sx={{
          margin: 0,
          marginLeft: "20px",
          color: "var(--dark-blue)",
          padding: "10px",
          fontSize: "2em",
          fontWeight: "bold",
        }}
      >
        System Logs
        <SystemLogs />
      </Typography>
    </Box>
  );
}
