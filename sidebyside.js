const fs = require("fs");

const settings = process.argv.slice(2).reduce(
  (settings, arg, index, argumentList) => {
    if (arg.includes(".txt"))
      return { ...settings, filenames: [...settings.filenames, arg] };
    if (arg === "-c") {
      return { ...settings, columnPadding: parseInt(argumentList[index + 1]) };
    }
    if (arg === "-s") {
      return { ...settings, columnWidth: parseInt(argumentList[index + 1]) };
    }
    return settings;
  },
  {
    filenames: [],
    columnWidth: null,
    columnPadding: 2,
    columnHeight: null,
  }
);

const texts = settings.filenames.map(readFiles);

settings.columnHeight = Math.max(...texts.map((lines) => lines.length));
settings.columnWidth =
  settings.columnWidth ||
  Math.max(
    ...texts.map((lines) => Math.max(...lines.map((line) => line.length)))
  );
const { columnHeight, columnWidth, columnPadding } = settings;

const textLines = texts.map((lines) => {
  return padText(lines);
});

function formatLine(line, lines = []) {
  if (line.length < columnWidth) {
    return [...lines, padLine(line)];
  }

  return formatLine(line.slice(columnWidth), [
    ...lines,
    line.slice(0, columnWidth),
  ]);
}

function readFiles(filename) {
  return fs.readFileSync(filename, "utf-8").split("\n");
}

function padText(lines) {
  return lines.concat(Array(columnHeight - lines.length).fill(""));
}

function padLine(line) {
  return line.replace("\t", "    ").padEnd(columnWidth, " ");
}

const formattedLines = textLines.map((text) =>
  text.flatMap((line) => formatLine(line))
);

const rows = [];
for (let j = 0; j < columnHeight; j++) {
  const row = [];
  for (let i = 0; i < formattedLines.length; i++) {
    row.push(formattedLines[i][j]);
  }
  rows.push(row.join(" ".repeat(columnPadding)));
}

console.log(rows.join("\n"));
