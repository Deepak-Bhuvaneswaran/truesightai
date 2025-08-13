import React, { useState, useMemo } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CssBaseline,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useDropzone } from "react-dropzone";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#4CAF50", "#F44336"];

// ---------------- Dropzone ----------------
function DropzoneUpload({ onFileSelected, accept }) {
  const [attachedFiles, setAttachedFiles] = useState([]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setAttachedFiles(acceptedFiles);
      if (onFileSelected) {
        // send only the first file to backend
        onFileSelected(acceptedFiles[0]);
      }
    },
    accept,
  });

  return (
    <div
      {...getRootProps()}
      style={{
        border: "2px dashed #1976d2",
        padding: "20px",
        backgroundColor: isDragActive ? "#e3f2fd" : "#fafafa",
        textAlign: "center",
        borderRadius: "8px",
        height: "100px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      <input {...getInputProps()} />
      <Typography sx={{ fontWeight: "bold" }}>
        {attachedFiles.length > 0
          ? `${attachedFiles.length} file${attachedFiles.length > 1 ? "s" : ""} attached`
          : isDragActive
          ? "Drop your file here..."
          : "Drag & drop or click to select a file"}
      </Typography>
      {attachedFiles.length > 0 && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          {attachedFiles.map((file) => file.name).join(", ")}
        </Typography>
      )}
    </div>
  );
}

// ---------------- Detection Panel ----------------
function DetectionPanel({ title, endpoint, accept, onResult }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = () => {
    if (!file) return alert("Please select a file first!");
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    fetch(endpoint, { method: "POST", body: formData })
      .then((res) => res.json())
      .then((data) => {
        setResult(data);
        onResult(title, data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        alert("Error processing file");
      });
  };

  return (
    <Card elevation={4} sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
          {title}
        </Typography>
        <DropzoneUpload onFileSelected={(file) => setFile(file)} accept={accept} />
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={loading || !file}
          sx={{ mt: 2, fontWeight: "bold" }}
          fullWidth
        >
          {loading ? <CircularProgress size={24} /> : "Check"}
        </Button>

        {result && (
          <Box
            mt={2}
            p={2}
            sx={{
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              Status:{" "}
              <span style={{ color: result.status === "Fake" ? "red" : "green" }}>
                {result.status}
              </span>
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "bold", color: "primary.main" }}>
              Confidence: {(result.confidence * 100).toFixed(2)}%
            </Typography>
            {result.transcript_excerpt && (
              <Typography variant="body2" sx={{ fontWeight: "500" }}>
                Transcript: {result.transcript_excerpt}
              </Typography>
            )}
            {result.reasoning && (
              <Typography variant="body2">Reasoning: {result.reasoning}</Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------- Pie Chart ----------------
function ResultsPieChart({ history }) {
  const chartData = [
    { name: "Real", value: history.filter((h) => h.status === "Real").length },
    { name: "Fake", value: history.filter((h) => h.status === "Fake").length },
  ];

  return (
    <PieChart width={300} height={300}>
      <Pie
        data={chartData}
        cx="50%"
        cy="50%"
        outerRadius={100}
        label
        dataKey="value"
      >
        {chartData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
}

// ---------------- Main App ----------------
export default function App() {
  const [history, setHistory] = useState([]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "light",
          primary: { main: "#1976d2" },
        },
        typography: {
          fontFamily: "Roboto, sans-serif",
        },
      }),
    []
  );

  const addToHistory = (type, res) => {
    setHistory((prev) => [
      { id: Date.now(), time: new Date().toLocaleString(), type, ...res },
      ...prev,
    ]);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: "bold",
              fontSize: "1.4rem",
            }}
          >
            TrueSightAI Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        {/* Detection Panels */}
        <Grid container spacing={4} alignItems="stretch">
          <Grid item xs={12} md={4}>
            <DetectionPanel
              title="Audio Detection"
              endpoint="http://localhost:8000/api/audio/audio-check/"
              accept={{ "audio/*": [".wav", ".mp3"] }}
              onResult={addToHistory}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <DetectionPanel
              title="Video Detection"
              endpoint="http://localhost:8000/api/video/video-check/"
              accept={{ "video/*": [".mp4", ".mov", ".avi"] }}
              onResult={addToHistory}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <DetectionPanel
              title="Text Detection"
              endpoint="http://localhost:8000/api/text/text-check/"
              accept={{
                "text/plain": [".txt"],
                "application/pdf": [".pdf"],
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
              }}
              onResult={addToHistory}
            />
          </Grid>
        </Grid>

        {/* Summary and History */}
        {history.length > 0 && (
          <Box mt={6}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontWeight: "bold", fontSize: "1.3rem" }}
            >
              Detection Summary
            </Typography>
            <ResultsPieChart history={history} />

            <Typography
              variant="h6"
              gutterBottom
              sx={{ mt: 4, fontWeight: "bold" }}
            >
              Recent History
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Time</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Confidence</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell sx={{ fontWeight: "500" }}>{h.time}</TableCell>
                    <TableCell sx={{ fontWeight: "500" }}>{h.type}</TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: h.status === "Fake" ? "red" : "green",
                      }}
                    >
                      {h.status}
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: "primary.main" }}
                    >
                      {(h.confidence * 100).toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
}
