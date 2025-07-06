const fs = require("fs");
const path = require("path");
const mm = require("music-metadata");

const audioExtensions = [".mp3", ".ogg", ".flac", ".wav"];
const baseUrl = "https://olliee2.github.io/audio/";

// Format the song name: remove extension, replace underscores, trim, capitalize
function formatSongName(filename) {
  const nameWithoutExt = path.parse(filename).name;
  const withSpaces = nameWithoutExt.replace(/_/g, " ").replace(/\s+/g, " ").trim();
  return withSpaces.replace(/\b\w/g, c => c.toUpperCase());
}

async function getAudioFiles(dir, relDir = "") {
  const files = fs.readdirSync(dir).filter(file => {
    const filePath = path.join(dir, file);
    return fs.statSync(filePath).isFile() && audioExtensions.includes(path.extname(file));
  });
  return await Promise.all(files.map(async file => {
    const filePath = path.join(dir, file);
    let duration;
    try {
      const metadata = await mm.parseFile(filePath);
      duration = metadata.format.duration ? Math.round(metadata.format.duration) : null;
    } catch (e) {
      duration = null;
    }
    // Calculate the relative path from the 'songs' directory for the URL
    const absoluteFilePath = path.resolve(dir, file);
    const songsRoot = path.resolve("./songs");
    const relativePath = path.relative(songsRoot, absoluteFilePath).replace(/\\/g, "/");
    return {
      name: formatSongName(file),
      url: baseUrl + "songs/" + relativePath,
      duration
    };
  }));
}

async function getFolders(dir, relDir = "") {
  const entries = fs.readdirSync(dir).filter(file => {
    const filePath = path.join(dir, file);
    return fs.statSync(filePath).isDirectory();
  });
  return await Promise.all(entries.map(async folder => {
    const folderPath = path.join(dir, folder);
    const folderRel = relDir ? relDir + "/" + folder : folder;
    const files = await getAudioFiles(folderPath, folderRel);
    const subfolders = await getFolders(folderPath, folderRel);
    return {
      name: folder,
      files,
      folders: subfolders.length > 0 ? subfolders : []
    };
  }));
}

(async () => {
  const name = "root";
  const files = await getAudioFiles("./songs", "songs");
  const folders = await getFolders("./songs");

  fs.writeFileSync("songs.json", JSON.stringify({name, files, folders}, null, 2));
})();
