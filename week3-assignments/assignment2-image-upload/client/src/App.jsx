import { useEffect, useRef, useState } from "react";
import axios from "axios";

const MAX_SIZE = 2 * 1024 * 1024; // keep in sync with the server limit
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function App() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);

  const loadImages = async () => {
    try {
      const { data } = await axios.get("/api/images");
      setImages(data.images);
    } catch {
      setError("Could not load images. Is the server running?");
    }
  };
  useEffect(() => { loadImages(); }, []);

  // Free the preview URL when it changes or the page closes
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const onSelect = (e) => {
    const chosen = e.target.files[0];
    setMessage("");
    if (!chosen) return;
    if (!TYPES.includes(chosen.type)) return reject("Please choose a JPG, PNG, WEBP or GIF image.");
    if (chosen.size > MAX_SIZE) return reject("Image is too large (max 2 MB).");
    setError("");
    setFile(chosen);
    setPreview(URL.createObjectURL(chosen)); // instant local preview, nothing uploaded yet
  };

  const reject = (msg) => {
    setError(msg);
    setFile(null);
    setPreview("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const upload = async () => {
    if (!file) return setError("Choose an image first.");
    const data = new FormData();
    data.append("image", file); // field name must match upload.single("image") on the server
    setBusy(true);
    setProgress(0);
    try {
      await axios.post("/api/upload", data, {
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / (e.total || file.size))),
      });
      setMessage("Image uploaded successfully.");
      setError("");
      setFile(null);
      setPreview("");
      if (inputRef.current) inputRef.current.value = "";
      loadImages();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Is the server running?");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (filename) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await axios.delete(`/api/images/${filename}`);
      setImages(images.filter((img) => img.filename !== filename));
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete the image.");
    }
  };

  return (
    <>
      <header className="nav"><span className="brand">Image Upload</span></header>
      <main className="container">
        <section className="panel form">
          <h2>Upload an image</h2>
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={onSelect} aria-label="Choose image" />
          {preview && (
            <div className="preview">
              <img src={preview} alt="Selected preview" />
              <small>{file.name} ({(file.size / 1024).toFixed(0)} KB)</small>
            </div>
          )}
          {busy && <progress value={progress} max="100" aria-label="Upload progress" />}
          <button className="btn" onClick={upload} disabled={busy || !file}>{busy ? `Uploading ${progress}%` : "Upload"}</button>
          {error && <p className="error-banner">{error}</p>}
          {message && <p className="success">{message}</p>}
        </section>

        <h2 className="list-title">Gallery <small>({images.length})</small></h2>
        {images.length === 0 ? <p className="empty">No images uploaded yet.</p> : (
          <div className="gallery">
            {images.map((img) => (
              <figure key={img.filename}>
                <a href={img.url} target="_blank" rel="noreferrer"><img src={img.url} alt="Uploaded" loading="lazy" /></a>
                <button className="btn btn-danger btn-small" onClick={() => remove(img.filename)}>Delete</button>
              </figure>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
export default App;
