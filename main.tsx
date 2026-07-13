import React, { useState } from 'react';
import { render, Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import koffi from "koffi";
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import 'dotenv/config'

const OPENROUTER_API_KEY=process.env.OPENROUTER_API_KEY;
const MODEL_NAME = process.env.OPENROUTER_MODEL;
const GEMINI_API_KEY = process.env.OPENROUTER_MODEL;

const ragSearch = tool({
  description: 'RAG検索、検索クエリーから検索する。',
  inputSchema: z.object({
    query: z.string().min(1, { message: '検索クエリーは必須です' }),
  }),
  execute: async ({ query }) => {
    const lib = koffi.load('./sample.dll');
    const rag_search = lib.func('const char* rag_search(const char* input)');
    const resp = rag_search(query);
    return resp; 
  },
});

const start_str = `Welcome
Chat app Example

`;

const ITEM_DATA = [
  {id: "-1" , type: "info", title: start_str},
];

const TEST_TEXT_DATA = `Test-Text-data-001 , Test-Text-data-002 , Test-Text-data-003 , Test-Text-data-004 , Test-Text-data-005, Test-Text-data-006
Test-Text-data-001 , Test-Text-data-002 , Test-Text-data-003 , Test-Text-data-004 , Test-Text-data-005, Test-Text-data-006
Test-Text-data-001 , Test-Text-data-002 , Test-Text-data-003 , Test-Text-data-004 , Test-Text-data-005, Test-Text-data-006
Test-Text-data-001 , Test-Text-data-002 , Test-Text-data-003 , Test-Text-data-004 , Test-Text-data-005, Test-Text-data-006
`;
function SearchCommandLine() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [items, setItems] = useState(ITEM_DATA);

  const handleSubmit = async (value) => {
    setSubmittedQuery(value);
    setQuery("")
    try{
      let targetStr = value;
      let responseText = "";
      const openrouter = createOpenRouter({
        apiKey: OPENROUTER_API_KEY,
      });
      const { text } = await generateText({
        model: openrouter(MODEL_NAME),
        prompt: targetStr,
        tools: {
          ragSearch
        },    
        stopWhen: stepCountIs(5),
      });
      responseText = text;

      const target = items;
      let uuid = crypto.randomUUID();
      target.push({id: uuid , type: "user" , title: targetStr})
      uuid = crypto.randomUUID();
      target.push({id: uuid , type: "ai" , title: responseText})

      setItems(target)
      setSubmittedQuery("");
    }catch(e){
      console.log(e)
    }
    //setTimeout(async() => {
    //}, 1000);		
  };


  return (
  <Box flexDirection="column" padding={1}>
    <Box flexDirection="row">
      <Box width="80%" flexDirection="column" padding={0}>
        {items.map(item => {
          if(item.type === "user"){
            return(
              <Box key={item.id} flexDirection="column" marginTop={1} 
              backgroundColor="#2C7CFF" paddingY={1} paddingX={2}>
                <Text bold color="white">{item.title}</Text>
              </Box>
            )
          }      
          if(item.type === "ai"){
            return(
              <Box key={item.id} flexDirection="column" borderStyle="round" marginBottom={0} padding={1}>
                <Text bold color="cyan">AI:</Text>
                <Text>{item.title}</Text>
              </Box>
            )
          }      
          if(item.type === "info"){
            return(
              <Box key={item.id} height={10} flexDirection="column" borderStyle="round" padding={1}>
                <Text bold color="cyan">{item.title}</Text>
                <Text>End: Ctrl + c</Text>
              </Box>
            )
          }      
        })}
      </Box>
      <Box width="20%" flexDirection="column" padding={1}>
        <Text bold >AppName:</Text>
        <Text bold marginTop={1}>version: 0.9.1</Text>
      </Box>    
    </Box>  
    {submittedQuery ? (
    <Box marginTop={1} marginBottom={1} marginLeft={1}>
      <Text color="green" marginTop={1}>Please Wait...</Text>
    </Box>
    ):(<Box />)}
    <Box flexDirection="column" borderStyle="round" padding={1}>
      <Box marginRight={1}>
        <Text bold color="cyan">Input: </Text>
        <TextInput 
          value={query} 
          onChange={setQuery} 
          onSubmit={handleSubmit} 
        />
      </Box>
      <Box marginTop={0} flexDirection="column">
        <Text dimColor>Type your text and press Enter:</Text>
      </Box>
    </Box>

  </Box>
  );  
}

const main = async function(){
  if(!OPENROUTER_API_KEY){
    console.log("OPENROUTER_API_KEY is not set.");
    return;
  }
  if(!MODEL_NAME){
    console.log("OPENROUTER_MODEL is not set.");
    return;
  }
  if(!GEMINI_API_KEY){
    console.log("GEMINI_API_KEY is not set.");
    return;
  }
  render(<SearchCommandLine />);
}
main();
