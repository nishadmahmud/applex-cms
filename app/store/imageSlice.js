import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const imageUpload = createAsyncThunk(
  "/image-upload",
  async ({ image, token }, thunkAPI) => {
    const formData = new FormData();
    formData.append("file_name", image);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/file-upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data.path; // returns image path
    } catch (err) {
      return thunkAPI.rejectWithValue("Image upload failed");
    }
  }
);

const initialState = {
  preview: "",
};

const imageSlice = createSlice({
  name: "image",
  initialState,
  reducers: {
    setPreview: (state, action) => {
      state.preview = action.payload;
    },
    resetPreview: (state) => {
      state.preview = initialState.preview;
    },
  },
});

export const { setPreview, resetPreview } = imageSlice.actions;
export default imageSlice.reducer;
