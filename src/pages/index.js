import { useState, useRef, useEffect } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/default.css"; // Import the Highlight.js style of your choice

export default function Home() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_ENDPOINT = "https://chat.cybee.ai/generate_response";
  const [sessionID, setSessionID] = useState(
    () => `session_${Math.random().toString(36).substr(2, 9)}`
  );
  const textareaRef = useRef(null);

  // Automatically focus the textarea when the component mounts
  useEffect(() => {
    textareaRef.current.focus();
  }, []);

  // Function to render messages with support for newline and code highlighting
  function NewlineText({ text }) {
    return text.split("\n").map((part, index) => {
      // Check if the part is a code block
      if (part.startsWith("<code>") && part.endsWith("</code>")) {
        const code = part.substring(6, part.length - 7); // Remove <code> tags
        const highlightedCode = hljs.highlightAuto(code).value;
        return (
          <pre key={index}>
            <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
          </pre>
        );
      }
      return (
        <span key={index}>
          {part}
          <br />
        </span>
      );
    });
  }

  // Handle message sending
  // Handle message sending
  const sendMessage = async () => {
    if (!message.trim()) return; // Ignore empty messages

    // Add message to chat history before clearing the textarea
    setChatHistory([...chatHistory, { type: "user", content: message }]);

    // Clear the message and immediately reset textarea's height
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "initial"; // Reset to initial height or a specific height like '2em'
    }

    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: message, session_id: sessionID }), // Include session_id here
      });

      if (!response.ok) throw new Error("Network response was not ok.");

      const data = await response.json();
      setChatHistory((prev) => [
        ...prev,
        { type: "llama", content: data.text },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setChatHistory((prev) => [
        ...prev,
        { type: "error", content: "Failed to communicate with the API." },
      ]);
    } finally {
      setLoading(false);
      // Ensure the textarea is focused for the next message
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  // Automatically resize the textarea based on its content
  function autoResize() {
    // Directly use the textareaRef here to adjust the height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }

  return (
    <div className="bg-gray-100 flex flex-col h-screen m-0 font-sans">
      <h1 className="text-center p-5 text-2xl font-bold text-gray-700">
        Hi! This is Cybee AI
      </h1>
      <div className="flex-grow overflow-y-scroll p-4 m-4 bg-white shadow rounded">
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div className={`message ${msg.type}`}>
              <NewlineText text={msg.content} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex p-4 space-x-4 bg-gray-200">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            autoResize(e);
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !loading) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type your message..."
          className="flex-grow p-2 bg-white border border-gray-300 rounded shadow focus:outline-none focus:border-blue-500"
          style={{ overflowY: "hidden" }}
          autoFocus
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className={`px-8 py-2 ${
            loading ? "bg-gray-500" : "bg-blue-500"
          } text-white font-semibold rounded shadow focus:outline-none hover:bg-blue-600 active:bg-blue-700`}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
