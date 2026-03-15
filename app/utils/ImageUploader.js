"use client";
import React from "react";
import { SquarePen, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ImageUploading from "react-images-uploading";

export const ImageUploader = ({
  number,
  uploadImmediately = false,
  uploadHandler,
  onDelete,
  onImageChange,
  clearUploader,
  setClearUploader,
  existingImageUrl = null,
}) => {
  const [images, setImages] = useState([]);
  const imageRemoveAllRef = useRef(null);
  const maxNumber = 3;

  useEffect(() => {
    if (existingImageUrl && images.length === 0) {
      setImages([{ data_url: existingImageUrl }]);
    }
  }, [existingImageUrl]);

  //   console.log(images);

  useEffect(() => {
    if (clearUploader) {
      if (imageRemoveAllRef.current) {
        imageRemoveAllRef.current(); // clear UI
        setClearUploader(false);
      }
      setImages([]);
    }
  }, [clearUploader]);

  // console.log(images);

  const onChange = async (imageList, addUpdateIndex) => {
    // data for submit
    setImages(imageList);
    // get images from parent
    if (onImageChange) {
      onImageChange(imageList[0]);
    }

    if (uploadImmediately && uploadHandler && imageList[0]) {
      try {
        const response = await uploadHandler(imageList[0]);
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div className="App">
      <ImageUploading
        multiple={false}
        value={images}
        onChange={onChange}
        maxNumber={maxNumber}
        dataURLKey="data_url"
      >
        {({
          imageList,
          onImageUpload,
          onImageRemoveAll,
          onImageUpdate,
          onImageRemove,
          isDragging,
          dragProps,
        }) => {
          // console.log(imageList);
          imageRemoveAllRef.current = onImageRemoveAll;
          return (
            // write your building UI
            <div>
              {imageList.length ? (
                imageList.map((image, index) => (
                  <div
                    key={index}
                    className="relative group bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    {/* Image Container */}
                    <div className="aspect-square relative">
                      <Image
                        src={image["data_url"] || "/placeholder.svg"}
                        alt={`image-${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />

                      {/* Overlay with buttons - appears on hover */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => onImageUpdate(index)}
                            className="bg-white text-gray-700 px-2 py-1.5 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors duration-150 flex items-center gap-1"
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onImageRemove(index), onDelete(index);
                            }}
                            className="bg-red-500 text-white px-2 py-1.5 rounded-md text-sm font-medium hover:bg-red-600 transition-colors duration-150 flex items-center gap-1"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Image number indicator */}
                    <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                      {number}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  onClick={onImageUpload}
                  {...dragProps}
                  className="border-2 border-dashed border-blue-200 rounded-lg p-8 text-center hover:border-blue-300 transition-colors cursor-pointer"
                >
                  <div className="space-y-3">
                    <Upload className="w-8 h-8 text-blue-300 mx-auto" />
                    <p className="text-sm text-gray-600">
                      Drop files here to upload
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        }}
      </ImageUploading>
    </div>
  );
};
