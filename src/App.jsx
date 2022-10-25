import { useState, useEffect } from "react";
import "./App.css";
import { storage } from "./config/firebaseConfig";
import { ref, uploadBytes, listAll } from "firebase/storage";

function App() {
  // state penampung preview image
  const [imagePrev, setImagePrev] = useState("");
  const [imageData, setImageData] = useState([]);
  const [refresh, setRefresh] = useState(false);

  // preview image before upload
  const handlePreviewImage = (e) => {
    // console.log(e);
    const file = e.target.files[0];
    // console.log(file);

    const reader = new FileReader();

    reader.onload = (res) => {
      // console.log(res.target.result);
      setImagePrev(res.target.result);
    };

    reader.readAsDataURL(file);
  };

  // handle upload to firebase
  const handleSubmit = (e) => {
    e.preventDefault();

    // tangkap file dari form
    const file = e.target.image.files[0];

    // filter file
    const allowFile = [
      "image/jpg image/jpeg, image/JPEG, image/png, image/gif",
    ];
    if (!allowFile.includes(file.type)) {
      return alert("File is not allowed");
    }

    // buat reference
    const uploadRef = ref(storage, "/simple_upload/" + file.name);

    // upload process
    uploadBytes(uploadRef, file)
      .then((res) => {
        console.log("file upload successfully");
        // reset
        setImagePrev("");
        setRefresh(!refresh);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // list semua image di folder simple_upload
  const listImage = async () => {
    let newArr = [];
    // ref dari folder simple_upload
    const sfRef = ref(storage, "/simple_upload");

    await listAll(sfRef)
      .then((res) => {
        res.items.forEach((e, i) => {
          console.log(e.name);
          newArr.push({
            id: i,
            url: `https://firebasestorage.googleapis.com/v0/b/rid-firebase.appspot.com/o/simple_upload%2F${e.name}?alt=media&token=ce971196-0291-41cf-98af-993a3e8bd495`,
          });
        });
      })
      .catch((err) => {
        console.error(err);
      });

    return newArr;
  };

  // component lifecycle
  useEffect(() => {
    listImage().then((res) => {
      console.log(res);
      setImageData(res);
    });
  }, [refresh]);

  return (
    <div className="App">
      <form className="form_image" onSubmit={handleSubmit}>
        <label htmlFor="image">Image</label>
        <input
          type="file"
          accept="image/jpg image/jpeg, image/JPEG, image/png, image/gif"
          onChange={handlePreviewImage}
          id="image"
          // multiple
        />
        <img src={imagePrev} alt="image prev" width={200} />

        <button type="submit">Submit</button>
      </form>

      {imageData.map((e) => (
        <img
          src={e.url}
          alt={e.url}
          key={e.id}
          style={{ width: 100, height: 100, objectFit: "cover", margin: 10 }}
        />
      ))}
    </div>
  );
}

export default App;
