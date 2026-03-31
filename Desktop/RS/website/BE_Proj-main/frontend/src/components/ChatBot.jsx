import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import "../styles/rojarAssistant.css";

/**
 * Floating entry point to the full-screen assistant + map at /assistant.
 */
export default function ChatBot() {
  const navigate = useNavigate();

  return (
    <div className="rs-bot-fab">
      <button
        type="button"
        className="rs-bot-trigger"
        onClick={() => navigate("/assistant")}
        title="Open AI Assistant (full page with map)"
      >
        <MessageCircle size={24} />
        <span className="rs-bot-badge">AI</span>
      </button>
    </div>
  );
}
