require("dotenv").config(); 

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

// Debug: check API key loaded
console.log("API KEY:", process.env.HF_API_KEY ? "Loaded ✅" : "Missing ❌");

app.get("/", (req, res) => {
  res.send("Fake News Detector API running");
});

app.post("/predict", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    console.log("Calling Hugging Face...");

    const response = await axios.post(
      "https://router.huggingface.co/hf-inference/models/facebook/bart-large-mnli",
      {
        inputs: text,
        parameters: {
          candidate_labels: ["fake news", "real news"]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Response received");

    const result = response.data;
    const label = result.labels?.[0];

    res.json({
      prediction: label === "fake news" ? "Fake News" : "Real News"
    });

  } catch (error) {
    console.error("ERROR:", error.response?.data || error.message);
    res.status(500).json({ error: "AI prediction failed" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});