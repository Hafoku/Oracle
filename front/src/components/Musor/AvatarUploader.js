import React, { useState, useRef } from "react";
import AvatarEditor from "react-avatar-editor";

const AvatarUploader = ({ onSave, onCancel }) => {
  const [image, setImage] = useState(null);
  const [scale, setScale] = useState(1);
  const editorRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleSave = () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas();
      canvas.toBlob((blob) => {
        onSave(blob);
      }, "image/png");
    }
  };

  const handleCancel = () => {
    setImage(null);
    setScale(1);
    onCancel();
  };

  return (
    <div className="avatar-uploader">
      {!image ? (
        <div className="file-upload-container">
          <label className="file-upload-label">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="file-input"
            />
          </label>
        </div>
      ) : (
        <div className="editor-container">
          <AvatarEditor
            ref={editorRef}
            image={image}
            width={200}
            height={200}
            border={50}
            borderRadius={100}
            scale={scale}
            className="avatar-editor"
          />
          <div className="scale-container">
            <span>Масштаб:</span>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="scale-slider"
            />
          </div>
          <div className="buttons-container">
            <button onClick={handleSave} className="green-button">
              Сохранить
            </button>
            <button onClick={handleCancel} className="red-button">
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarUploader;
