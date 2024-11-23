import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Link } from "react-router-dom";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import useClipboard from "react-use-clipboard";
import axios from "axios";
import {
  ChakraProvider,
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  Flex,
} from "@chakra-ui/react";
import Translator from "./Translator";

const App = () => {
  const [textToCopy, setTextToCopy] = useState("");
  const [isCopied, setCopied] = useClipboard(textToCopy, {
    successDuration: 1000,
  });
  const [chatResponse, setChatResponse] = useState("");
  const [videoSuggestions, setVideoSuggestions] = useState([]);

  const startListening = useCallback(
    () => SpeechRecognition.startListening({ continuous: true, language: "en-IN" }),
    []
  );

  const stopListening = useCallback(
    () => SpeechRecognition.stopListening(),
    []
  );

  const commands = [
    {
      command: "start",
      callback: () => startListening(),
    },
    {
      command: "stop",
      callback: () => stopListening(),
    },
  ];

  const {
    transcript,
    browserSupportsSpeechRecognition,
    listening,
  } = useSpeechRecognition({ commands });

  useEffect(() => {
    if (listening) {
      console.log("Listening...");
    } else {
      console.log("Not listening...");
    }
  }, [listening]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  const handleCopy = () => {
    setTextToCopy(transcript);
    setCopied();
  };

  const handleSend = async () => {
    setTextToCopy(transcript);
    setCopied();
    if (!textToCopy) {
      alert("No text to send");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:5000/chat", {
        prompt: textToCopy,
      });
      setChatResponse(response.data.response);
      suggestVideos(response.data.response);
    } catch (error) {
      console.error("Error fetching chat response:", error);
      setChatResponse("Error fetching response.");
    }
  };

  const suggestVideos = async (text) => {
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: "You are a helpful assistant." },
              {
                role: "user",
                content: `Give youtube video links from reputable sources for the medical keywords in: ${text}`,
              },
            ],
            max_tokens: 100,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const suggestions = data.choices[0].message.content.trim().split("\n");
      setVideoSuggestions(suggestions);
    } catch (error) {
      console.error("Error fetching video suggestions:", error);
      setVideoSuggestions([
        `Error fetching video suggestions: ${error.message}`,
      ]);
    }
  };

  return (
    <ChakraProvider>
      <Router>
        <Flex
          as="nav"
          bg="teal.500"
          color="white"
          p={4}
          mb={5}
          justifyContent="space-between"
        >
          <Box>
            <Text fontSize="35px" fontWeight="bold">
              EduMed
            </Text>
          </Box>
          <HStack spacing={4}>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </HStack>
        </Flex>
        <Box className="container" p={5}>
          <Text
            as="h1"
            fontSize="4xl"
            fontWeight="bold"
            mb={4}
            textAlign="center"
          >
            SRI JAYADEVA INSTITUTE OF CARDIOVASCULAR SCIENCES AND RESEARCH
          </Text>
          <Text as="h3" fontSize="2xl">
            Start Recording!
          </Text>
          <Box
            className="main-content"
            borderWidth="2px"
            borderRadius="lg"
            p={10}
            mt={4}
          >
            <Text>{transcript}</Text>
          </Box>
          <HStack spacing={3} mt={4}>
            <Button onClick={handleCopy}>
              {isCopied ? "Copied!" : "Copy to clipboard"}
            </Button>
            <Button onClick={startListening} disabled={listening}>
              Start Listening
            </Button>
            <Button onClick={stopListening} disabled={!listening}>
              Stop Listening
            </Button>
            <Button onClick={handleSend}>Send</Button>
          </HStack>
          <VStack spacing={4} mt={6}>
            <Input
              placeholder="Type your message or use speech-to-text"
              value={textToCopy}
              onChange={(e) => setTextToCopy(e.target.value)}
            />
            <Box borderWidth="2px" borderRadius="lg" p={10} w="100%">
              <Text>{chatResponse}</Text>
            </Box>
            <Box borderWidth="2px" borderRadius="lg" p={10} w="100%">
              <Text fontSize="xl" fontWeight="bold">
                Video Suggestions
              </Text>
              {videoSuggestions.map((video, index) => (
                <Text key={index}>{video}</Text>
              ))}
            </Box>
          </VStack>
        </Box>
        <Translator />
      </Router>
    </ChakraProvider>
  );
};

export default App;



