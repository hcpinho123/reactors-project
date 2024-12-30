import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ReactorRodeType } from "../types/ReactorRodeType";
import { CustomReactorChart } from "../components/CustomReactorChart";
import { Box, Button, ButtonGroup, Typography } from "@mui/material";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";

export function ReactorPage() {
  const { id } = useParams();

  const [output, setOutput] = useState<number>(0);
  const [coolant, setCoolant] = useState<"on" | "off">("off");
  const [temperature, setTemperature] = useState<number>(0);
  const [temperatureUnit, setTemperatureUnit] = useState<
    "celsius" | "fahrenheit"
  >("celsius");
  const [tempStatus, setTempStatus] = useState<
    "Safe" | "Caution" | "Danger" | null
  >(null);
  const [fuelLevel, setFuelLevel] = useState<number>(0);
  const [reactorState, setReactorState] = useState<"Active" | "Offline" | null>(
    null
  );

  const [temperatureHistory, setTemperatureHistory] = useState<number[]>([]); // Store temperature over time
  const [controlRods, setControlRods] = useState<ReactorRodeType>({
    in: 0,
    out: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const intervalId: number = setInterval(async () => {
      async function fetchControlRods() {
        const rawResponse = await fetch(
          `https://nuclear.dacoder.io/reactors/rod-state/${id}?apiKey=1bb4dff552124f3c`
        );
        const parsedResponse = await rawResponse.json();
        setControlRods(parsedResponse.control_rods);
      }
      await fetchControlRods();

      async function fetchOutput() {
        const rawResponse = await fetch(
          `https://nuclear.dacoder.io/reactors/output/${id}?apiKey=1bb4dff552124f3c`
        );
        const parsedResponse = await rawResponse.json();
        setOutput(parsedResponse.output.amount);
      }
      await fetchOutput();

      async function fetchCoolant() {
        const rawResponse = await fetch(
          `https://nuclear.dacoder.io/reactors/coolant/${id}?apiKey=1bb4dff552124f3c`
        );
        const parsedResponse = await rawResponse.json();
        setCoolant(parsedResponse.coolant);
      }
      await fetchCoolant();

      async function fetchTemperature() {
        const rawResponse = await fetch(
          `https://nuclear.dacoder.io/reactors/temperature/${id}?apiKey=1bb4dff552124f3c`
        );
        const parsedResponse = await rawResponse.json();
        const tempAmount = parsedResponse.temperature.amount;
        const tempUnit = parsedResponse.temperature.unit;
        const tempStatus = parsedResponse.temperature.status;

        setTemperatureUnit(tempUnit);
        setTempStatus(tempStatus);
        setTemperature(tempAmount);

        setTemperatureHistory((prev) => [...prev, tempAmount].slice(-300));
      }
      await fetchTemperature();

      async function fetchFuelLevel() {
        const rawResponse = await fetch(
          `https://nuclear.dacoder.io/reactors/fuel-level/${id}?apiKey=1bb4dff552124f3c`
        );
        const parsedResponse = await rawResponse.json();
        setFuelLevel(parsedResponse.fuel.percentage.toFixed(2));
      }
      await fetchFuelLevel();

      async function fetchReactorState() {
        const rawResponse = await fetch(
          `https://nuclear.dacoder.io/reactors/reactor-state/${id}?apiKey=1bb4dff552124f3c`
        );
        const parsedResponse = await rawResponse.json();
        setReactorState(parsedResponse.state);
      }
      await fetchReactorState();
    }, 1000);

    return () => clearInterval(intervalId);
  }, [id]);

  const handleControlledShutdown = async () => {
    try {
      const url = `https://nuclear.dacoder.io/reactors/controlled-shutdown/${id}?apiKey=1bb4dff552124f3c`;
      const response = await fetch(url, { method: "POST" });

      console.log("Controlled Shutdown Status:", response.status);

      if (response.status === 201) {
        setError(null);
      } else {
        setError("Controlled shutdown failed");
      }
    } catch (err) {
      setError("Error performing controlled shutdown");
      console.error("Controlled shutdown error:", err);
    }
  };

  const handleEmergencyShutdown = async () => {
    try {
      const url = `https://nuclear.dacoder.io/reactors/emergency-shutdown/${id}?apiKey=1bb4dff552124f3c`;
      const response = await fetch(url, { method: "POST" });

      console.log("Emergency Shutdown Status:", response.status);

      if (response.status === 201) {
        setError(null);
      } else {
        setError("Emergency shutdown failed");
      }
    } catch (err) {
      setError("Error performing emergency shutdown");
      console.error("Emergency shutdown error:", err);
    }
  };

  const handleRaiseRods = async () => {
    try {
      const url = `https://nuclear.dacoder.io/reactors/raise-rod/${id}?apiKey=1bb4dff552124f3c`;
      const response = await fetch(url, { method: "POST" });

      if (response.status === 201) {
        setError(null);
      } else {
        setError("Raise Rods failed");
      }
    } catch (err) {
      setError("Error performing raise rods");
      console.error("Raise Rods error:", err);
    }
  };

  const handleDropRods = async () => {
    try {
      const url = `https://nuclear.dacoder.io/reactors/drop-rod/${id}?apiKey=1bb4dff552124f3c`;
      const response = await fetch(url, { method: "POST" });

      if (response.status === 201) {
        setError(null);
      } else {
        setError("Drop Rods failed");
      }
    } catch (err) {
      setError("Error performing drop rods");
      console.error("Drop Rods error:", err);
    }
  };

  const handleMantainance = async () => {
    try {
      const url = `https://nuclear.dacoder.io/reactors/maintenance/${id}?apiKey=1bb4dff552124f3c`;
      const response = await fetch(url, { method: "POST" });

      if (response.status === 201) {
        setError(null);
        handleRefuel();
      } else {
        setError("Mantainance failed");
      }
    } catch (err) {
      setError("Error performing Mantainance");
      console.error("Mantainance error:", err);
    }
  };

  const handleRefuel = async () => {
    try {
      const url = `https://nuclear.dacoder.io/reactors/refuel/${id}?apiKey=1bb4dff552124f3c`;
      const response = await fetch(url, { method: "POST" });

      if (response.status === 201) {
        setError(null);
        handleMantainance();
      } else {
        setError("Refuel failed");
      }
    } catch (err) {
      setError("Error performing refuel");
      console.error("Refuel error:", err);
    }
  };

  const handleCoolant = async () => {
    const bodyData = {
      coolant: coolant === "on" ? "off" : "on",
    };

    try {
      const url = `https://nuclear.dacoder.io/reactors/coolant/${id}?apiKey=1bb4dff552124f3c`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (response.status === 201) {
        setError(null);
      } else {
        setError("Coolant failed");
      }
    } catch (err) {
      setError("Error performing coolant");
      console.error("Coolant error:", err);
    }
  };

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
          paddingTop: "80px",
          paddingBottom: "80px",
        }}
      >
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
            <CustomReactorChart temperatureHistory={temperatureHistory} />
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
            onClick={handleControlledShutdown}
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
            onClick={handleEmergencyShutdown}
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
            width: "60vw",
            margin: "0 auto",
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "20px",
            marginTop: "20px",
          }}
        >
          <Button
            sx={{
              backgroundColor: "var(--dark-blue)",
              color: "var(--white)",
              fontWeight: "bold",
              minWidth: "113px",
              maxWidth: "214px",
              borderRadius: "10px",
              padding: "10px",
            }}
            variant="contained"
            onClick={handleCoolant}
          >
            Turn Coolant's {coolant === "on" ? "Off" : "On"}
          </Button>
          <Button
            sx={{
              backgroundColor: "orange",
              color: "var(--white)",
              fontWeight: "bold",
              minWidth: "113px",
              maxWidth: "214px",
              borderRadius: "10px",
              padding: "10px",
            }}
            onClick={handleMantainance}
            variant="contained"
          >
            Refuel Reactor
          </Button>

          <ButtonGroup
            sx={{
              borderRadius: "10px",
            }}
            variant="contained"
            aria-label="Basic button group"
          >
            <Button
              sx={{
                color: "var(--white)",
                fontWeight: "bold",
                minWidth: "113px",
                maxWidth: "300px",
                padding: "10px",
              }}
              onClick={handleRaiseRods}
            >
              Raise Rods
            </Button>
            <Button
              sx={{
                color: "var(--white)",
                fontWeight: "bold",
                minWidth: "113px",
                maxWidth: "300px",
                padding: "10px",
              }}
              onClick={handleDropRods}
            >
              Drop Rods
            </Button>
          </ButtonGroup>
        </Box>
        <Box
          sx={{
            width: "60vw",
            display: "flex",
            backgroundColor: "var(--white)",
            flexDirection: "column",
            justifyContent: "start",
            margin: "0 auto",
            borderRadius: "10px",
            padding: "20px",
            color: "var(--dark-blue)",
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: "var(--dark-blue)",
            }}
          >
            Reactor Info
          </Typography>

          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: "bold",
            }}
          >
            Coolant State: {coolant}
          </Typography>

          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: "bold",
            }}
          >
            Current Temperature:{" "}
            {temperatureUnit === "fahrenheit"
              ? `${temperature.toFixed(2)} °F`
              : `${temperature.toFixed(2)} °C`}
          </Typography>

          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: "bold",
            }}
          >
            Temperature Status: {tempStatus}
          </Typography>

          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: "bold",
            }}
          >
            Fuel Level : {fuelLevel}%
          </Typography>

          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: "bold",
            }}
          >
            Output: {output} MW
          </Typography>

          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: "bold",
            }}
          >
            Rod State:
          </Typography>

          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: "bold",
            }}
          >
            Number of Rods In: {controlRods.in}
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: "bold",
            }}
          >
            Number of Rods Out: {controlRods.out}
          </Typography>
        </Box>
        <Box
          sx={{
            width: "63vw",
            display: "flex",
            justifyContent: "start",
            alignItems: "center",
            margin: "0 auto",
            gap: "5px",
            marginTop: "10px",
          }}
        >
          <Box
            sx={{
              backgroundColor: "var(--red)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "5px",
              borderRadius: "50%",
            }}
          >
            <PowerSettingsNewIcon sx={{ color: "var(--white)" }} />
          </Box>
          <Typography
            sx={{
              color: "var(--dark-blue)",
              fontWeight: "bold",
            }}
          >
            Reactor State: {reactorState}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
