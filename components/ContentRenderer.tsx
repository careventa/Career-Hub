type Props = {
  content: string;
};

export function ContentRenderer({ content }: Props) {
  const blocks = content
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className="space-y-4 text-gray-700 leading-7">
      {blocks.map((block, index) => {
        if (block.startsWith("### ")) {
          return <h3 key={index} className="text-xl font-semibold text-gray-900">{block.replace("### ", "")}</h3>;
        }

        if (block.startsWith("- ")) {
          return (
            <ul key={index} className="list-disc pl-6 space-y-2">
              {block
                .split("\n")
                .filter((item) => item.trim().startsWith("- "))
                .map((item, itemIndex) => (
                  <li key={itemIndex}>{item.replace("- ", "")}</li>
                ))}
            </ul>
          );
        }

        return <p key={index}>{block}</p>;
      })}
    </div>
  );
}
