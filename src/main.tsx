import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Validate Convex URL
const convexUrl = import.meta.env.VITE_CONVEX_URL;
if (!convexUrl) {
  console.error("❌ VITE_CONVEX_URL is not configured!");
  console.error("📋 To fix this:");
  console.error("1. Open a terminal and run: npx convex dev");
  console.error("2. Login with your account (required for Convex)");
  console.error("3. Copy the Convex URL provided");
  console.error("4. Add it to your .env file: VITE_CONVEX_URL=https://your-url.convex.cloud");
  console.error("5. Restart the dev server: npm run dev:frontend");
  
  // Show user-friendly error in the browser
  document.getElementById("root")!.innerHTML = `
    <div style="font-family: system-ui; max-width: 700px; margin: 50px auto; padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
      <div style="background: white; padding: 30px; border-radius: 8px;">
        <h2 style="color: #667eea; margin-top: 0; display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 32px;">🔧</span> Setup Required
        </h2>
        <p style="color: #555; font-size: 16px; margin: 20px 0;">
          Welcome to <strong style="color: #e63946;">RAKTDAAN</strong>! 🩸 To get started, you need to connect to Convex (the backend).
        </p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <h3 style="margin-top: 0; color: #333; font-size: 18px;">Quick Setup (2 minutes):</h3>
          <ol style="color: #555; line-height: 2; padding-left: 20px; margin: 15px 0;">
            <li><strong>Open PowerShell</strong> in this project folder</li>
            <li>Run: <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; color: #d63384; font-weight: 600;">npx convex dev</code></li>
            <li><strong>Login</strong> with Google/GitHub when prompted (creates free account)</li>
            <li><strong>Create a project</strong> when asked (name it "raktdaan")</li>
            <li><strong>Copy the URL</strong> shown (looks like: <span style="color: #0066cc;">https://abc123.convex.cloud</span>)</li>
            <li>Open <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; color: #d63384;">.env</code> file in the project</li>
            <li>Set: <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; color: #d63384; display: block; margin-top: 8px;">VITE_CONVEX_URL=https://your-url.convex.cloud</code></li>
            <li><strong>Save</strong> and refresh this page!</li>
          </ol>
        </div>

        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <p style="margin: 0; color: #856404;">
            <strong>💡 Why Convex?</strong> It provides real-time database, authentication, and serverless functions for the app - all for free!
          </p>
        </div>

        <div style="margin-top: 25px; padding-top: 20px; border-top: 2px solid #e9ecef;">
          <h3 style="color: #333; font-size: 16px; margin-bottom: 10px;">📚 Need Help?</h3>
          <ul style="color: #555; line-height: 1.8; padding-left: 20px;">
            <li>Check <strong>COMPLETE_THIS_SETUP.md</strong> for detailed instructions</li>
            <li>Visit <a href="https://docs.convex.dev" target="_blank" style="color: #667eea;">Convex Docs</a></li>
            <li>Free Convex account: <a href="https://dashboard.convex.dev" target="_blank" style="color: #667eea;">Sign up here</a></li>
          </ul>
        </div>
      </div>
    </div>
  `;
  throw new Error("VITE_CONVEX_URL environment variable is required");
}

const convex = new ConvexReactClient(convexUrl);

createRoot(document.getElementById("root")!).render(
  <ConvexAuthProvider client={convex}>
    <App />
  </ConvexAuthProvider>,
);
