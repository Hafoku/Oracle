import React, { useState, useRef } from "react";
import AvatarEditor from "react-avatar-editor";
import Logger from "../Logger";
import "../App.css";

const AvatarUploader = ({ onSave, onCancel }) => {
  const [image, setImage] = useState(null);
  const [scale, setScale] = useState(1);
  const editorRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      Logger.logInfo('Avatar file selected', { 
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type 
      });
      setImage(file);
    }
  };

  const handleSave = () => {
    if (editorRef.current) {
      Logger.logInfo('Processing avatar image for save');
      const canvas = editorRef.current.getImageScaledToCanvas();
      canvas.toBlob((blob) => {
        Logger.logSuccess('Avatar image processed successfully', {
          blobSize: blob.size,
          blobType: blob.type
        });
        onSave(blob);
      }, "image/png");
    }
  };

  const handleCancel = () => {
    Logger.logInfo('Avatar upload cancelled');
    setImage(null);
    setScale(1);
    onCancel();
  };

  const handleScaleChange = (e) => {
    const newScale = parseFloat(e.target.value);
    Logger.logInfo('Avatar scale changed', { scale: newScale });
    setScale(newScale);
  };

  return (
    <div className="oracle-container">
      {!image ? (
        <div className="file-upload-container">
          <label className="oracle-btn oracle-btn-primary oracle-btn-block file-upload-label">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="file-input"
            />
            <span>Выберите фото</span>
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
              onChange={handleScaleChange}
              className="scale-slider"
            />
          </div>
          <div className="buttons-container">
            <button onClick={handleSave} className="oracle-btn oracle-btn-primary oracle-btn-large">
              Сохранить
            </button>
            <button onClick={handleCancel} className="oracle-btn oracle-btn-large">
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarUploader;
