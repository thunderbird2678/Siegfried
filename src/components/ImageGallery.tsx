import React, { useState, useEffect } from "react";
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
  const [loading, setLoading] = useState<boolean>(true);

  const columns: Column[] = [
    { height: 0, images: [] },
    { height: 0, images: [] },
    { height: 0, images: [] },
  ];

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
        setLoading(false);
      }
    };

    fetchImages();
  }, [bucket, storageFull, storageThumbs]);

  useEffect(() => {
    if (!loading) {
      renderImages();
    }
  }, [loading]);

  const renderImages = () => {
    const sortedImages = Array.from(images.keys()).sort();
    sortedImages.forEach((key) => {
      const image = new Image();
      const imageElement = images.get(key);
      const src = imageElement?.thumbnailUrl || "";
      image.src = src;
      image.onload = () => {
        const minHeightColumn = columns.findIndex((col) => {
          return (
            col.height === Math.min(...columns.map((column) => column.height))
          );
        });
        columns[minHeightColumn].height =
          columns[minHeightColumn].height + image.naturalHeight;
        columns[minHeightColumn].images.push(
          <div key={key} className="p-4 bg-white">
            {<img src={imageElement?.thumbnailUrl} alt="" />}
          </div>
        );
      };
    });
  };

  return (
    <div className=" bg-slate-200 ">
      <div className="container mx-auto pt-20 grid gap-4 grid-cols-3">
        {!loading &&
          Array.from(images.keys())
            .sort()
            .map((key) => {
              const image = images.get(key);
              return (
                <div key={key} className="p-4 bg-white">
                  <img src={image?.thumbnailUrl} alt="" />
                </div>
              );
            })}
      </div>
    </div>
  );
};

export default ImageGallery;
