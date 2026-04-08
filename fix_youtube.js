const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // ensure args: [] is passing
  content = content.replace(
    /func: (isPlaying \? "playVideo" : "pauseVideo")\n\s+\}\)/g,
    'func: isPlaying ? "playVideo" : "pauseVideo",\n      args: []\n    })'
  );
  content = content.replace(
    /func: (isMuted \? "mute" : "unMute")\n\s+\}\)/g,
    'func: isMuted ? "mute" : "unMute",\n      args: []\n    })'
  );
  
  // ensure playVideo gets args
  content = content.replace(
    /JSON.stringify\(\{ event: "command", func: "playVideo" \}\)/g,
    'JSON.stringify({ event: "command", func: "playVideo", args: [] })'
  );

  // iframe onLoad event
  if (!content.includes('onLoad={() => {')) {
    content = content.replace(
      /ref=\{iframeRef\}/g,
      `ref={iframeRef}\n            onLoad={() => {\n              if (iframeRef.current?.contentWindow) {\n                iframeRef.current.contentWindow.postMessage(\n                  JSON.stringify({ event: "listening" }), \n                  "*"\n                )\n              }\n            }}`
    );
  }

  // send target domain instead of "*" for better security and stability
  content = content.replace(
    /"\*"/g,
    '"https://www.youtube-nocookie.com"'
  );
  
  fs.writeFileSync(filePath, content);
}

fixFile('components/video-hero.tsx');
fixFile('app/company/page.tsx');
