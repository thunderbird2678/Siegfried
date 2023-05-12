import React, { useState, useEffect } from "react";
import { cloneDeep } from "lodash";
import { useParams } from "react-router-dom";
import { getDownloadURL, getStorage, listAll, ref } from "firebase/storage";
import { FIREBASE_APP } from "../firebase";

interface Image {
  fullUrl: string;
  thumbnailUrl?: string;
}

interface Column {
  height: number;
  images: JSX.Element[];
}

const ImageGallery: React.FC = () => {
  const { bucket } = useParams();
  const [images, setImages] = useState<Map<string, Image>>(new Map());

  const [fetchLoading, setFetchLoading] = useState<boolean>(true);
  const [renderLoading, setRenderLoading] = useState<boolean>(true);

  const [columns, setColumns] = useState<Column[]>([
    { height: 0, images: [] },
    { height: 0, images: [] },
    { height: 0, images: [] },
  ]);

  const storageFull = getStorage(FIREBASE_APP, bucket);
  const storageThumbs = getStorage(FIREBASE_APP, `${bucket}_thumbs`);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const tempImages: Map<string, Image> = new Map();

        // Fetch full images
        const fullImageRefs = await listAll(ref(storageFull, "/"));
        await Promise.all(
          fullImageRefs.items.map(async (itemRef) => {
            const url = await getDownloadURL(itemRef);
            tempImages.set(itemRef.name, { fullUrl: url });
          })
        );

        // Fetch thumbnail images
        const thumbnailImageRefs = await listAll(ref(storageThumbs, "/"));
        await Promise.all(
          thumbnailImageRefs.items.map(async (itemRef) => {
            const url = await getDownloadURL(itemRef);
            const existingImage = tempImages.get(itemRef.name);
            tempImages.set(itemRef.name, {
              fullUrl: existingImage?.fullUrl ?? "",
              thumbnailUrl: url,
            });
          })
        );

        setImages(tempImages);
      } catch (error) {
        console.error(error);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchImages();
  }, [bucket, storageFull, storageThumbs]);

  useEffect(() => {
    if (!fetchLoading) {
      generateColumns();
    }
  }, [fetchLoading]);

  const generateColumns = () => {
    const sortedImages = Array.from(images.keys()).sort();
    console.log("sortedImages: ", sortedImages);
    const tempColumns = cloneDeep(columns);
    sortedImages.forEach((key, index) => {
      const image = new Image();
      const imageElement = images.get(key);
      const src = imageElement?.thumbnailUrl || "";
      image.src = src;
      image.onload = () => {
        const minHeightColumn = tempColumns.findIndex((col) => {
          return (
            col.height ===
            Math.min(...tempColumns.map((column) => column.height))
          );
        });
        tempColumns[minHeightColumn].height += image.naturalHeight + 96;
        tempColumns[minHeightColumn].images.push(
          <div key={key} className="mb-4 p-4 bg-white max-w-[500px]">
            {<img src={imageElement?.thumbnailUrl} alt="" />}
          </div>
        );
        console.log(
          `added image ${imageElement?.thumbnailUrl} to column ${
            minHeightColumn + 1
          } which now has height ${tempColumns[minHeightColumn].height}`
        );
        if (index === sortedImages.length - 1) {
          setColumns(tempColumns);
          setRenderLoading(false);
        }
      };
    });
  };

  const columnStyle = "flex mx-2 flex-col";

  return !renderLoading ? (
    <div className="flex py-8 justify-center">
      <div className={columnStyle}>{columns[0].images}</div>
      <div className={columnStyle}>{columns[1].images}</div>
      <div className={columnStyle}>{columns[2].images}</div>
    </div>
  ) : (
    <></>
  );
};

export default ImageGallery;
