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
 *   s.dataset.tenantId='YOUR_PUBLIC_WIDGET_ID';
 *   s.dataset.engineUrl='https://omniweb-engine-rs6fr.ondigitalocean.app';
 *   d.head.appendChild(s);
 * })();
 * </script>
 */
(function () {
  "use strict";

  var CANONICAL_ENGINE_URL = "https://omniweb-engine-rs6fr.ondigitalocean.app";

  function getDataAttribute(element, key) {
    if (!element) {
      return "";
    }
    if (element.dataset && element.dataset[key]) {
      return element.dataset[key];
    }
    return element.getAttribute("data-" + key.replace(/[A-Z]/g, function (letter) {
      return "-" + letter.toLowerCase();
    })) || "";
  }

  function normalizeEngineUrl(value) {
    if (!value) {
      return CANONICAL_ENGINE_URL;
    }

    try {
      var parsed = new URL(value, window.location.origin);
      if (parsed.host === "api.omniweb.ai") {
        return CANONICAL_ENGINE_URL;
      }
      return parsed.toString().replace(/\/$/, "");
    } catch (error) {
      if (String(value).indexOf("api.omniweb.ai") !== -1) {
        return CANONICAL_ENGINE_URL;
      }
      return String(value).replace(/\/$/, "");
    }
  }

  function injectBackendWidget(scriptTag, publicWidgetId, engineUrl) {
    var backendScript = document.createElement("script");
    backendScript.src = engineUrl + "/widget.js";
    backendScript.async = true;
    backendScript.setAttribute("data-tenant-id", publicWidgetId);

    var position = getDataAttribute(scriptTag, "position");
    var color = getDataAttribute(scriptTag, "color");
    if (position) {
      backendScript.setAttribute("data-position", position);
    }
    if (color) {
      backendScript.setAttribute("data-color", color);
    }

    (document.head || document.body || document.documentElement).appendChild(backendScript);
  }

  // Find our own script tag to read data attributes (/widget/loader.js or /widget.js rewrite)
  var scripts = document.querySelectorAll(
    'script[src*="widget/loader"], script[src*="widget.js"]'
  );
  var scriptTag = scripts[scripts.length - 1];
  if (!scriptTag) {
    console.error("[Omniweb] Loader script tag not found");
    return;
  }

  var publicWidgetId =
    getDataAttribute(scriptTag, "tenantId") ||
    getDataAttribute(scriptTag, "publicWidgetId") ||
    getDataAttribute(scriptTag, "embedCode");
  var engineUrl = normalizeEngineUrl(
    getDataAttribute(scriptTag, "engineUrl") || CANONICAL_ENGINE_URL
  );

  if (!publicWidgetId) {
    console.error("[Omniweb] Missing data-tenant-id attribute");
    return;
  }

  injectBackendWidget(scriptTag, publicWidgetId, engineUrl);
})();
