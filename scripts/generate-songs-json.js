const fs = require("fs");
const path = require("path");

const audioExtensions = [".mp3", ".ogg", ".flac", ".wav"];
const baseUrl = "https://olliee2.github.io/audio/";

function getAudioFiles(dir, relDir = "") {
  return fs.readdirSync(dir).filter(file => {
    const filePath = path.join(dir, file);
    return fs.statSync(filePath).isFile() && audioExtensions.includes(path.extname(file));
  }).map(file => ({
    type: "file",
    name: file,
    url: baseUrl + (relDir ? relDir + "/" : "") + file
  }));
}

function getFolders(dir) {
  return fs.readdirSync(dir).filter(file => {
    const filePath = path.join(dir, file);
    return fs.statSync(filePath).isDirectory();
  }).map(folder => ({
    name: folder,
    files: getAudioFiles(path.join(dir, folder), folder)
  }));
}

const root = getAudioFiles(".", "songs");
const folders = getFolders(".");

fs.writeFileSync("songs.json", JSON.stringify({root, folders}, null, 2));