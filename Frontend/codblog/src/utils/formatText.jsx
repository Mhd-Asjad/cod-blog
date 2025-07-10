export const formatText = (text) => {
  const formattedText = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  return formattedText;
};

export const formatTextToJSX = (text) => {
    if (!text) return null;
  
    return text.split('\n').map((paragraph, pIndex) => (
      <p key={pIndex} className="mb-2 last:mb-0">
        {paragraph.split(/(\*\*.*?\*\*)/g).map((segment, sIndex) => {
          if (segment.startsWith('**') && segment.endsWith('**')) {
            return <strong key={sIndex}>{segment.slice(2, -2)}</strong>;
          }
          return segment;
        })}
      </p>
    ));
  };