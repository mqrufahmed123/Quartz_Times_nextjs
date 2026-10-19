const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/heic-sequence': 'heic',
  'image/heif-sequence': 'heif',
};

export interface ImageDrop {
  files: File[];
  urls: string[];
}

/** Accept image sources, never navigation links, scripts, or local filesystem URLs. */
export function normalizeDroppedImageUrl(value: string, origin: string): string | null {
  const source = value.trim();
  if (/^data:image\//i.test(source)) return `data:${source.slice(5)}`;
  if (!source || /[\u0000-\u0020]/.test(source)) return null;

  try {
    let url = new URL(source, origin);
    if (url.protocol === 'blob:') {
      return url.origin === new URL(origin).origin ? url.href : null;
    }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;

    // Images dragged from this storefront otherwise point at Next's optimization endpoint.
    for (let depth = 0; depth < 3; depth++) {
      if (url.origin !== new URL(origin).origin || url.pathname !== '/_next/image') break;
      const original = url.searchParams.get('url');
      if (!original) return null;
      url = new URL(original, origin);
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    }
    return url.href;
  } catch {
    return null;
  }
}

function dataImageFile(source: string, index: number): File {
  const comma = source.indexOf(',');
  const header = source.slice(0, comma);
  const match = /^data:(image\/[a-z0-9+-]+)(;base64)?$/i.exec(header);
  const mime = match?.[1].toLowerCase();
  if (comma < 0 || !mime || !IMAGE_EXTENSIONS[mime]) {
    throw new Error('This embedded image format is not supported. Download it as JPG, PNG, WebP, GIF, AVIF, or HEIC and upload the file.');
  }

  const payload = source.slice(comma + 1);
  let bytes: Uint8Array<ArrayBuffer>;
  if (match?.[2]) {
    // Bound encoded input before decoding to avoid allocating an oversized image.
    if (payload.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + 1024) {
      throw new Error('Each image must be 15 MB or smaller.');
    }
    const encoded = payload.replace(/\s/g, '');
    let decoded: string;
    try {
      decoded = atob(encoded);
    } catch {
      throw new Error('The dragged image data is invalid. Download the image and upload the file instead.');
    }
    bytes = Uint8Array.from(decoded, character => character.charCodeAt(0));
  } else {
    if (payload.length > MAX_IMAGE_BYTES * 3) throw new Error('Each image must be 15 MB or smaller.');
    const decoded: number[] = [];
    for (let index = 0; index < payload.length; index++) {
      if (payload[index] === '%') {
        const hex = payload.slice(index + 1, index + 3);
        if (!/^[a-f0-9]{2}$/i.test(hex)) throw new Error('The dragged image data is invalid.');
        decoded.push(Number.parseInt(hex, 16));
        index += 2;
      } else {
        const code = payload.charCodeAt(index);
        if (code > 127) throw new Error('The dragged image data is invalid.');
        decoded.push(code);
      }
      if (decoded.length > MAX_IMAGE_BYTES) throw new Error('Each image must be 15 MB or smaller.');
    }
    bytes = Uint8Array.from(decoded);
  }
  if (!bytes.length) throw new Error('The dragged image is empty.');
  if (bytes.length > MAX_IMAGE_BYTES) throw new Error('Each image must be 15 MB or smaller.');
  return new File([bytes], `dropped-image-${index + 1}.${IMAGE_EXTENSIONS[mime]}`, { type: mime });
}

async function blobImageFile(source: string, index: number): Promise<File> {
  try {
    const response = await fetch(source, { credentials: 'omit' });
    if (!response.ok) throw new Error('Unavailable image');
    const blob = await response.blob();
    const mime = blob.type.toLowerCase().split(';')[0].trim();
    if (!IMAGE_EXTENSIONS[mime]) throw new Error('Unsupported image');
    if (!blob.size || blob.size > MAX_IMAGE_BYTES) throw new Error('Image size');
    return new File([blob], `dropped-image-${index + 1}.${IMAGE_EXTENSIONS[mime]}`, { type: mime });
  } catch {
    throw new Error('This browser image cannot be accessed. Download it as an image under 15 MB and upload the file instead.');
  }
}

/** Read drag data immediately; the browser only exposes its contents during the drop event. */
export async function readImageDrop(transfer: DataTransfer, origin: string): Promise<ImageDrop> {
  const files = Array.from(transfer.files);
  if (!files.length) {
    for (const item of Array.from(transfer.items || [])) {
      if (item.kind !== 'file') continue;
      const file = item.getAsFile();
      if (file) files.push(file);
    }
  }
  // A browser can provide a file and the same image's HTML/URL. Upload only the file.
  if (files.length) return { files, urls: [] };

  const html = transfer.getData('text/html');
  const uriList = transfer.getData('text/uri-list');
  const plain = transfer.getData('text/plain');
  const imageSources: string[] = [];
  if (html) {
    // Parse into an inert document. None of the dropped HTML is inserted into the page.
    const document = new DOMParser().parseFromString(html, 'text/html');
    for (const image of Array.from(document.querySelectorAll('img'))) {
      const source = image.currentSrc || image.getAttribute('src');
      if (source) imageSources.push(source);
    }
  }
  // Dragging a linked photo often supplies a webpage in uri-list; its img source wins.
  const candidates = imageSources.length ? imageSources : [
    ...uriList.split(/\r?\n/).filter(line => line.trim() && !line.trim().startsWith('#')),
    ...(plain.trim() && /^(https?:|data:image\/|blob:)/i.test(plain.trim()) ? [plain] : []),
  ];
  const sources = Array.from(new Set(candidates.map(source => normalizeDroppedImageUrl(source, origin)).filter((source): source is string => Boolean(source))));
  if (!sources.length) {
    throw new Error('Drop image files or drag a photo itself from another browser tab. Links to webpages and text cannot be uploaded.');
  }

  const urls: string[] = [];
  for (let index = 0; index < sources.length; index++) {
    const source = sources[index];
    if (source.startsWith('data:')) files.push(dataImageFile(source, index));
    else if (source.startsWith('blob:')) files.push(await blobImageFile(source, index));
    else urls.push(source);
  }
  return { files, urls };
}
