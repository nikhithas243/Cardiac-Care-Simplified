import React, { useState } from 'react';
import { Box, Button, Select, Textarea, VStack, Heading } from '@chakra-ui/react';
import axios from 'axios';

const Translator = () => {
  const [text, setText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('kn'); // Default to Kannada

  const handleTranslate = async () => {
    const languageMap = {
      'kn': 'Kannada',
      'hi': 'Hindi' // Kannada language mapping
    };

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-3.5-turbo",
        messages: [
          { "role": "system", "content": `You are a helpful assistant that translates text into ${languageMap[targetLanguage]}.` },
          { "role": "user", "content": `Translate the following text to ${languageMap[targetLanguage]}: ${text}` }
        ],
        max_tokens: 1000, // Increase max_tokens to capture more text
        temperature: 0.5,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        }
      });

      // Combine all parts of the response
      const fullTranslation = response.data.choices.map(choice => choice.message.content.trim()).join(" ");
      setTranslatedText(fullTranslation);
    } catch (error) {
      console.error('Error translating text:', error);
      setTranslatedText('Error translating text. Please try again.');
    }
  };

  return (
    <VStack spacing={4} p={5}>
      <Heading>Understand better in your native language!!</Heading>
      <Textarea
        placeholder="Enter text to translate"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
        <option value="hi">Hindi</option>
        <option value="kn">Kannada</option> {/* Kannada option */}
      </Select>
      <Button onClick={handleTranslate} colorScheme="teal">Translate</Button>
      <Box w="100%">
        <Heading size="md">Translated Text</Heading>
        <Textarea value={translatedText} isReadOnly />
      </Box>
    </VStack>
  );
};

export default Translator;
