import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import "../index.css";
import { ReactorType } from "../types/ReactorType";
import { useEffect, useState } from "react";
import { ReactorRodeType } from "../types/ReactorRodeType";
import { TempUnit } from "../types/TempUnit";
import { useNavigate } from "react-router";

export default function ReactorCard(props: {
  reactor: ReactorType;
  temperatureUnit: TempUnit | null;
}) {
  const [controlRods, setControlRods] = useState<ReactorRodeType>({
    in: 0,
    out: 0,
  });
  const [output, setOutput] = useState<number>(0);
  const [temperature, setTemperature] = useState<number>(0);
  const [shutdownStatus, setShutdownStatus] = useState({
    controlled: false,
    emergency: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [coolant, setCoolant] = useState<"on" | "off" | null>(null);

  const navigate = useNavigate();

  const handleControlledShutdown = async (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const url = `https://nuclear.dacoder.io/reactors/controlled-shutdown/${props.reactor.id}?apiKey=1bb4dff552124f3c`;
      const response = await fetch(url, { method: "POST" });

      console.log("Controlled Shutdown Status:", response.status);

      if (response.status === 201) {
        setShutdownStatus((prev) => ({ ...prev, controlled: true }));
        setError(null);
      } else {
        setError("Controlled shutdown failed");
      }
    } catch (err) {
      setError("Error performing controlled shutdown");
      console.error("Controlled shutdown error:", err);
    }
  };

  const handleEmergencyShutdown = async (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const url = `https://nuclear.dacoder.io/reactors/emergency-shutdown/${props.reactor.id}?apiKey=1bb4dff552124f3c`;
      const response = await fetch(url, { method: "POST" });

      console.log("Emergency Shutdown Status:", response.status);

      if (response.status === 201) {
        setShutdownStatus((prev) => ({ ...prev, emergency: true }));
        setError(null);
      } else {
        setError("Emergency shutdown failed");
      }
    } catch (err) {
      setError("Error performing emergency shutdown");
      console.error("Emergency shutdown error:", err);
    }
  };

  useEffect(() => {
    const intervalId: number = setInterval(async () => {
      async function fetchControlRods() {
        const rawResponse = await fetch(
          `https://nuclear.dacoder.io/reactors/rod-state/${props.reactor.id}?apiKey=1bb4dff552124f3c`
        );
        const parsedResponse = await rawResponse.json();
        setControlRods(parsedResponse.control_rods);
      }
      await fetchControlRods();

      async function fetchOutput() {
        const rawResponse = await fetch(
          `https://nuclear.dacoder.io/reactors/output/${props.reactor.id}?apiKey=1bb4dff552124f3c`
        );
        const parsedResponse = await rawResponse.json();
        setOutput(parsedResponse.output.amount);
      }
      await fetchOutput();

      async function fetchCoolant() {
        const rawResponse = await fetch(
          `https://nuclear.dacoder.io/reactors/coolant/${props.reactor.id}?apiKey=1bb4dff552124f3c`
        );
        const parsedResponse = await rawResponse.json();
        setCoolant(parsedResponse.coolant);
      }
      await fetchCoolant();

      async function fetchTemperature() {
        const rawResponse = await fetch(
          `https://nuclear.dacoder.io/reactors/temperature/${props.reactor.id}?apiKey=1bb4dff552124f3c`
        );
        const parsedResponse = await rawResponse.json();
        setTemperature(parsedResponse.temperature.amount.toFixed(2));
      }
      await fetchTemperature();
    }, 2000);

    return () => clearInterval(intervalId);
  }, [props.reactor.id]);

  const card = (
    <React.Fragment>
      <div
        style={{
          cursor: "pointer",
        }}
        onClick={() => {
          navigate(`/reactor/${props.reactor.id}`);
        }}
      >
        <CardContent>
          <Box
            display="grid"
            gridTemplateColumns="repeat(2, 1fr)"
            gap="10px"
            width="100%"
            alignItems="center"
            justifyContent="center"
          >
            <div>
              <Typography
                sx={{
                  margin: 0,
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "var(--dark-blue)",
                }}
              >
                CONTROL RODS
              </Typography>
              <Typography
                sx={{ color: "dark-grey", fontSize: "13px", margin: "2px" }}
              >
                In: {controlRods.in} | Out: {controlRods.out}
              </Typography>
            </div>
            <div>
              <Typography
                sx={{
                  margin: 0,
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "var(--dark-blue)",
                }}
              >
                OUTPUT
              </Typography>
              <Typography
                sx={{ color: "dark-grey", fontSize: "13px", margin: "2px" }}
              >
                {output} MW
              </Typography>
            </div>
            <div>
              <Typography
                sx={{
                  margin: 0,
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "var(--dark-blue)",
                }}
              >
                COOLANT
              </Typography>
              <Typography
                sx={{ color: "dark-grey", fontSize: "13px", margin: "2px" }}
              >
                {coolant}
              </Typography>
            </div>
            <div>
              <Typography
                sx={{
                  margin: 0,
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "var(--dark-blue)",
                }}
              >
                TEMPERATURE
              </Typography>
              <Typography
                sx={{ color: "dark-grey", fontSize: "13px", margin: "2px" }}
              >
                {temperature} {props.temperatureUnit}
              </Typography>
            </div>
          </Box>
        </CardContent>
        <CardActions>
          <Button
            sx={{
              fontSize: "0.8rem",
              backgroundColor: "var(--green)",
              color: "var(--dark-blue)",
              fontWeight: "bold",
              borderRadius: "10px",
            }}
            variant="contained"
            onClick={(e) => handleControlledShutdown(e)}
          >
            CONTROLLED SHUTDOWN
          </Button>
          <Button
            sx={{
              fontSize: "0.8rem",
              backgroundColor: "var(--red)",
              fontWeight: "bold",
              borderRadius: "10px",
            }}
            variant="contained"
            onClick={(e) => handleEmergencyShutdown(e)}
          >
            EMERGENCY SHUTDOWN
          </Button>
        </CardActions>
      </div>
    </React.Fragment>
  );

  return (
    <Box sx={{ minWidth: "275px", maxWidth: "400px" }}>
      <Card sx={{ borderRadius: "10px" }} variant="outlined">
        {card}
      </Card>
    </Box>
  );
}
