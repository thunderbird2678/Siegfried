import React, { useState, useEffect } from "react";
import { cloneDeep } from "lodash";
import { useParams } from "react-router-dom";
import classNames from "classnames";

import {
  getDownloadURL,
  getStorage,
  listAll,
  ref,
  StorageReference,
} from "firebase/storage";
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
  // const [images, setImages] = useState<Map<string, Image>>(new Map());
  const [bucketIndex, setBucketIndex] = useState<number>(0);
  const [imageRefs, setImageRefs] = useState<StorageReference[]>([]);

  const [fetchLoading, setFetchLoading] = useState<boolean>(true);
  const [renderLoading, setRenderLoading] = useState<boolean>(false);

  const [columns, setColumns] = useState<Column[]>([
    { height: 0, images: [] },
    { height: 0, images: [] },
    { height: 0, images: [] },
  ]);

  // const storageFull = getStorage(FIREBASE_APP, bucket);
  const storageThumbs = getStorage(FIREBASE_APP, `${bucket}_thumbs`);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        // const tempImages: Map<string, Image> = new Map();

        // Fetch full images
        // const fullImageRefs = await listAll(ref(storageFull, "/"));
        // await Promise.all(
        //   fullImageRefs.items.map(async (itemRef) => {
        //     const url = await getDownloadURL(itemRef);
        //     tempImages.set(itemRef.name, { fullUrl: url });
        //   })
        // );

        // Fetch thumbnail images
        const thumbnailImageRefs = await listAll(ref(storageThumbs, "/"));
        const refs = thumbnailImageRefs.items.sort(
          (a: StorageReference, b: StorageReference) =>
            a.name > b.name ? 1 : -1
        );
        setImageRefs(refs);
      } catch (error) {
        console.error(error);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    if (!fetchLoading) {
      pushImages();
    }
  }, [fetchLoading]);

  const pushImages = async () => {
    const tempColumns = cloneDeep(columns);
    let tempBucketIndex = bucketIndex;
    for (let ref of imageRefs) {
      tempBucketIndex += 1;
      const url = await getDownloadURL(ref);
      const image = new Image();
      image.src = url;
      await image.decode();
      const minHeightColumn = tempColumns.findIndex((col: Column) => {
        return (
          col.height ===
          Math.min(...tempColumns.map((col: Column) => col.height))
        );
      });
      tempColumns[minHeightColumn].height += image.naturalHeight;
      tempColumns[minHeightColumn].images.push(
        <div key={ref.name} className={classNames("mb-2 max-w-[500px]")}>
          {
            <img
              className={
                tempBucketIndex === imageRefs.length - 1
                  ? "observer"
                  : undefined
              }
              src={url}
              alt=""
            />
          }
        </div>
      );
      if (tempBucketIndex === imageRefs.length - 1) {
        setColumns(tempColumns);
        setRenderLoading(false);
      }
    }
    setBucketIndex(tempBucketIndex);
  };

  const columnStyle = "flex mx-2 flex-col";

  let options = {
    rootMargin: "0px",
    threshold: 0.5,
  };

  let callback = (entries, observer) => {
    entries.forEach((entry) => {
      console.log("observer hit: ", entry);
    });
  };

  let observer = new IntersectionObserver(callback, options);
  let target = document.querySelector("#observer");
  if (target) {
    observer.observe(target);
  }

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
