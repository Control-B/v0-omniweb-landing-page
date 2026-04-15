/**
 * Omniweb AI Widget Loader
 *
 * Usage: Paste this in your HTML before </body>:
 *
 * <script>
 * (function(){
 *   var d=document,s=d.createElement('script');
 *   s.src='https://omniweb.ai/widget/loader.js';
 *   s.async=true;
 *   s.dataset.embedCode='YOUR_EMBED_CODE';
 *   s.dataset.agentId='YOUR_AGENT_ID';
 *   s.dataset.engineUrl='https://api.omniweb.ai';
 *   d.head.appendChild(s);
 * })();
 * </script>
 */
(function () {
  "use strict";

  // Find our own script tag to read data attributes
  var scripts = document.querySelectorAll('script[src*="widget/loader"]');
  var scriptTag = scripts[scripts.length - 1];

  if (!scriptTag) {
    console.error("[Omniweb] Loader script tag not found");
    return;
  }

  var embedCode = scriptTag.dataset.embedCode || scriptTag.getAttribute("data-embed-code");
  var agentId = scriptTag.dataset.agentId || scriptTag.getAttribute("data-agent-id");
  var engineUrl = scriptTag.dataset.engineUrl || scriptTag.getAttribute("data-engine-url") || "https://api.omniweb.ai";
  var platformUrl = scriptTag.dataset.platformUrl || scriptTag.getAttribute("data-platform-url") || "https://omniweb.ai";
  var position = scriptTag.dataset.position || "right";
  var color = scriptTag.dataset.color || "#6366f1";

  if (!embedCode) {
    console.error("[Omniweb] Missing data-embed-code attribute");
    return;
  }

  // Validate the embed code with the engine
  fetch(engineUrl + "/api/embed/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embed_code: embedCode,
      domain: window.location.hostname,
    }),
  })
    .then(function (res) {
      if (!res.ok) {
        return res.json().then(function (err) {
          throw new Error(err.detail || "Embed code validation failed");
        });
      }
      return res.json();
    })
    .then(function (data) {
      if (!data.valid) {
        console.error("[Omniweb] Invalid embed code");
        return;
      }

      // Use the agent_id from validation response if not provided
      var resolvedAgentId = agentId || data.agent_id;
      if (!resolvedAgentId) {
        console.error("[Omniweb] No agent ID configured");
        return;
      }

      // Inject the widget iframe
      var iframe = document.createElement("iframe");
      iframe.src =
        platformUrl +
        "/widget/" +
        resolvedAgentId +
        "?embed=" +
        encodeURIComponent(embedCode) +
        "&color=" +
        encodeURIComponent(color);
      iframe.style.cssText =
        "position:fixed;bottom:0;z-index:2147483647;border:none;background:transparent;" +
        (position === "left" ? "left:0;" : "right:0;") +
        "width:420px;height:700px;max-height:100dvh;max-width:100vw;" +
        "pointer-events:none;";
      iframe.allow = "microphone";
      iframe.title = "Omniweb AI Assistant";
      iframe.id = "omniweb-widget-frame";

      // Listen for messages from the iframe to manage pointer-events
      window.addEventListener("message", function (e) {
        if (e.data && e.data.type === "omniweb:widget-expanded") {
          iframe.style.pointerEvents = "auto";
        } else if (e.data && e.data.type === "omniweb:widget-collapsed") {
          iframe.style.pointerEvents = "none";
          // Keep the orb button clickable
          iframe.style.width = "100px";
          iframe.style.height = "100px";
          iframe.style.pointerEvents = "auto";
        } else if (e.data && e.data.type === "omniweb:widget-ready") {
          // Widget loaded — set to collapsed size
          iframe.style.width = "100px";
          iframe.style.height = "100px";
          iframe.style.pointerEvents = "auto";
        }
      });

      document.body.appendChild(iframe);
    })
    .catch(function (err) {
      console.error("[Omniweb] Widget load failed:", err.message);
    });
})();
