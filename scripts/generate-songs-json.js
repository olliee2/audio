const fs = require("fs");
const path = require("path");

const audioExtensions = [".mp3", ".ogg", ".flac", ".wav"];
const baseUrl = "https://olliee2.github.io/audio/";

// Format the song name: remove extension, replace underscores, trim, capitalize
function formatSongName(filename) {
  const nameWithoutExt = path.parse(filename).name;
  const withSpaces = nameWithoutExt.replace(/_/g, " ").replace(/\s+/g, " ").trim();
  return withSpaces.replace(/\b\w/g, c => c.toUpperCase());
}

function getAudioFiles(dir, relDir = "") {
  return fs.readdirSync(dir).filter(file => {
    const filePath = path.join(dir, file);
    return fs.statSync(filePath).isFile() && audioExtensions.includes(path.extname(file));
  }).map(file => ({
    name: formatSongName(file),
    url: baseUrl + (relDir ? relDir + "/" : "") + file
  }));
}

function getFolders(dir, relDir = "") {
  return fs.readdirSync(dir).filter(file => {
    const filePath = path.join(dir, file);
    return fs.statSync(filePath).isDirectory();
  }).map(folder => {
    const folderPath = path.join(dir, folder);
    const folderRel = relDir ? relDir + "/" + folder : folder;
    const files = getAudioFiles(folderPath, folderRel);
    const subfolders = getFolders(folderPath, folderRel);
    if (files.length === 0 && subfolders.length === 0) return null;
    const result = { name: folder, files };
    if (subfolders.length > 0) result.folders = subfolders;
    return result;
  }).filter(Boolean);
}

const root = getAudioFiles(".", "songs");
const folders = getFolders(".");

fs.writeFileSync("songs.json", JSON.stringify({ root, folders }, null, 2));