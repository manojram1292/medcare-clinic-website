'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const MAX_WIDTH = 1920;
const QUALITY = 0.82;
const SOFT_TARGET_KB = 500;

type Props = {
  name: string;                // form field name
  currentUrl?: string | null;
  recommended?: string;        // e.g. "1600×900 (16:9 widescreen)"
  clearName?: string;          // checkbox name for "remove current"
  helpText?: string;
};

export default function ImageUploadField({
  name, currentUrl, recommended = '1600×900 jpg, under 500 KB',
  clearName, helpText,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hiddenFileRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [origKB, setOrigKB] = useState<number | null>(null);
  const [outKB, setOutKB] = useState<number | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Sync the resized File into a hidden file input (the real field that
  // submits with the form). The visible input is only the picker.
  function setUploadFile(file: File | null) {
    if (!hiddenFileRef.current) return;
    const dt = new DataTransfer();
    if (file) dt.items.add(file);
    hiddenFileRef.current.files = dt.files;
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) { resetPreview(); setUploadFile(null); return; }
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      e.target.value = '';
      return;
    }
    setError(null);
    setBusy(true);
    setOrigKB(Math.round(file.size / 1024));
    try {
      const { blob, width, height } = await resizeImage(file, MAX_WIDTH, QUALITY);
      const out = new File([blob], rename(file.name), { type: 'image/jpeg' });
      setOutKB(Math.round(blob.size / 1024));
      setDims({ w: width, h: height });
      setPreview(URL.createObjectURL(blob));
      setUploadFile(out);
    } catch (err) {
      setError((err as Error).message || 'Could not process the image.');
      setUploadFile(null);
    } finally {
      setBusy(false);
    }
  }

  function resetPreview() {
    setPreview(null); setOrigKB(null); setOutKB(null); setDims(null); setError(null);
  }

  // Revoke the blob URL on unmount
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  return (
    <div className="image-upload-field">
      {currentUrl && !preview && (
        <div className="iuf-current">
          <Image src={currentUrl} alt="" width={120} height={80}
            style={{ objectFit: 'cover', borderRadius: 8 }} />
          {clearName && (
            <label className="iuf-clear">
              <input type="checkbox" name={clearName} /> Remove current image
            </label>
          )}
        </div>
      )}

      <div className="iuf-pick">
        <button type="button" className="btn btn-outline iuf-pick-btn"
          onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? 'Processing…' : preview ? 'Choose a different image' : currentUrl ? 'Replace image' : 'Choose image'}
        </button>
        <span className="iuf-rec">Best: {recommended}</span>
      </div>

      <input ref={inputRef} type="file" accept="image/*" onChange={onPick}
        style={{ display: 'none' }} />
      {/* The real submitted file — populated by our resize step. */}
      <input ref={hiddenFileRef} type="file" name={name}
        style={{ display: 'none' }} tabIndex={-1} aria-hidden />

      {error && <div className="iuf-error">⚠ {error}</div>}

      {preview && (
        <div className="iuf-preview">
          <Image src={preview} alt="" width={240} height={140} unoptimized
            style={{ objectFit: 'cover', borderRadius: 8 }} />
          <div className="iuf-stats">
            <div><strong>Will upload:</strong> {dims?.w}×{dims?.h}px · {outKB} KB</div>
            {origKB != null && outKB != null && origKB > outKB && (
              <div style={{ color: 'var(--text-3)' }}>
                Original was {origKB} KB ({Math.round((1 - outKB / origKB) * 100)}% smaller after resize)
              </div>
            )}
            {outKB && outKB > SOFT_TARGET_KB && (
              <div className="iuf-warn">
                Still over {SOFT_TARGET_KB} KB — works fine but try a smaller source next time.
              </div>
            )}
          </div>
        </div>
      )}

      {helpText && <div className="iuf-help">{helpText}</div>}
    </div>
  );
}

function rename(orig: string): string {
  const base = orig.replace(/\.[^.]+$/, '').replace(/[^a-z0-9-]+/gi, '-').slice(0, 60) || 'image';
  return `${base}.jpg`;
}

async function resizeImage(file: File, maxWidth: number, quality: number) {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const ratio = img.naturalWidth > maxWidth ? maxWidth / img.naturalWidth : 1;
    const width = Math.round(img.naturalWidth * ratio);
    const height = Math.round(img.naturalHeight * ratio);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not available in this browser.');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    const blob: Blob = await new Promise((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not encode image.'))),
        'image/jpeg', quality),
    );
    return { blob, width, height };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not read this image.'));
    img.src = src;
  });
}
