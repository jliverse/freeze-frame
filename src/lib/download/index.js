import FileSaver from 'file-saver';

export function download(
  data,
  filename,
  mimeType = 'application/octet-stream'
) {
  FileSaver.saveAs(new Blob([data], { type: mimeType }), filename);
}
