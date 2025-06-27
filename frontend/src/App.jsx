import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const WORK_DURATION = 25 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;
const CYCLE_COUNT = 4;

const formatTime = (seconds) => {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
};

const getTimeString = () =>
  new Date().toLocaleTimeString("ko-KR", { hour12: false });

export default function App() {
  const [secondsLeft, setSecondsLeft] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [phase, setPhase] = useState("집중");
  const [history, setHistory] = useState([]);
  const [phaseComplete, setPhaseComplete] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  // 타이머 로직
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);

          if (!phaseComplete && startTime) {
            const endTime = getTimeString();
            setHistory((h) => [
              ...h,
              `${startTime} ~ ${endTime} - ${phase} 완료`,
            ]);
            setPhaseComplete(true);
            setStartTime(null);
          }

          // phase 전환
          if (phase === "집중") {
            if (cycle === CYCLE_COUNT - 1) {
              setPhase("긴 휴식");
              setSecondsLeft(LONG_BREAK);
              setCycle(0);
            } else {
              setPhase("짧은 휴식");
              setSecondsLeft(SHORT_BREAK);
              setCycle((c) => c + 1);
            }
          } else {
            setPhase("집중");
            setSecondsLeft(WORK_DURATION);
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // phase 변경 시 기록 플래그 초기화
  useEffect(() => {
    setPhaseComplete(false);
  }, [phase]);

  // canvas에 상태 + 시간 그리기
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000000";
    ctx.font = "20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`상태: ${phase}`, canvas.width / 2, 40);

    ctx.font = "48px sans-serif";
    ctx.fillText(formatTime(secondsLeft), canvas.width / 2, 100);
  }, [secondsLeft, phase]);

  const enterPiP = async () => {
    const stream = canvasRef.current.captureStream();
    videoRef.current.srcObject = stream;
    await videoRef.current.play();
    await videoRef.current.requestPictureInPicture();
  };

  const toggleTimer = () => {
    if (!isRunning) {
      setStartTime(getTimeString());
    }
    setIsRunning((prev) => !prev);
  };

  const resetAll = () => {
    setIsRunning(false);
    setPhase("집중");
    setSecondsLeft(WORK_DURATION);
    setCycle(0);
    setHistory([]);
    setPhaseComplete(false);
    setStartTime(null);
  };

  return (
    <Stack spacing={3} alignItems="center" mt={5}>
      <Typography variant="h4">🕒 뽀모도로 타이머</Typography>
      <Typography variant="h6">현재 상태: {phase}</Typography>
      <Typography variant="h2">{formatTime(secondsLeft)}</Typography>

      <Stack spacing={2} direction="row">
        <Button variant="contained" onClick={toggleTimer}>
          {isRunning ? "일시정지" : "시작"}
        </Button>
        <Button variant="outlined" onClick={resetAll}>
          초기화
        </Button>
        <Button variant="outlined" onClick={enterPiP}>
          PiP 모드
        </Button>
      </Stack>

      <Typography variant="h6" mt={4}>
        기록
      </Typography>
      <List sx={{ maxHeight: 150, overflowY: "auto", width: 300 }}>
        {history.map((entry, idx) => (
          <ListItem key={idx} disablePadding>
            <ListItemText primary={entry} />
          </ListItem>
        ))}
      </List>

      {/* 숨김 요소들 */}
      <canvas
        ref={canvasRef}
        width={300}
        height={150}
        style={{ display: "none" }}
      />
      <video ref={videoRef} style={{ display: "none" }} />
    </Stack>
  );
}
