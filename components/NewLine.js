function NewlineText({ text }) {
  const lines = text.split("\n");
  const renderedLines = [];
  let detectedLanguage = "";

  for (let i = 0; i < lines.length; i++) {
    const str = lines[i];

    if (str.startsWith("<code>")) {
      let codeContent = "";
      let endIndex;

      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].endsWith("</code>")) {
          endIndex = j;
          break;
        }
        codeContent += lines[j] + "\n";
      }

      if (endIndex != null) {
        const highlightedCode = hljs.highlightAuto(codeContent);
        detectedLanguage = highlightedCode.language || "Unknown"; // If detected language is undefined, set it to "Unknown"
        const highlightedValue = highlightedCode.value;

        renderedLines.push(
          <div key={i}>
            <div className="code-header">{detectedLanguage}</div>
            <pre>
              <code dangerouslySetInnerHTML={{ __html: highlightedValue }} />
            </pre>
          </div>
        );

        i = endIndex; // Move the index to the line after `</code>`
      }
    } else {
      renderedLines.push(
        <div key={i}>
          {str}
          <br />
        </div>
      );
    }
  }

  return renderedLines;
}
