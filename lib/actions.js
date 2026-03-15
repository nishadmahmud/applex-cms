/* eslint-disable no-undef */
"use server";

import axios from "axios";
import { getServerSession } from "next-auth";
import { authOption } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath, revalidateTag } from "next/cache";

const getToken = async () => {
  const session = await getServerSession(authOption);
  const token = session?.accessToken;
  return token;
};

export const handleRemoveSlider = async (id) => {
  const token = await getToken();
  try {
    await axios.delete(
      `${process.env.NEXT_PUBLIC_API}/new/delete-sliders/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    revalidateTag("sliders");
    return {
      success: true,
      status: 201,
    };
  } catch (error) {
    return {
      status: 422,
      success: false,
      message: error.response.data.message,
    };
  }
};



export const deleteCategory = async (id) => {
  const token = await getToken();
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API}/delete-category`,
      { categoryId: id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    revalidateTag("categories");
    return {
      success: true,
      status: res.data.status,
      message: res.data.message,
    };
  } catch (error) {
    return {
      status: 422,
      success: false,
      message: error.response.data.message,
    };
  }
};

export const handleImageUpload = async (formData, fieldName=null) => {
  const token = await getToken();
  const newFormData = new FormData();
  let payload = null;
  if(!fieldName){
    payload = formData;
  }else{
    const image_url = formData.get(fieldName);
    newFormData.append("file_name", image_url);
    payload = newFormData;
  }
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API}/file-upload`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data.path;
  } catch (error) {
    console.log(error);
    return {
      status: 400,
      message: "error occured",
    };
  }
};

export const handleMultipleImageUpload = async (formData, fieldName=null) => {
  const token = await getToken();
  const newFormData = new FormData();
  let payload = null;
  if(!fieldName){
    payload = formData;
  }else{
    const images = formData.getAll(fieldName);
    images.forEach((file) => newFormData.append("pictures[]",file));
    payload = newFormData;
  }
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API}/multiple-file-upload`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data.path;
  } catch (error) {
    console.log(error);
    return {
      status: 400,
      message: "error occured",
    };
  }
};

export const createCategory = async (formData) => {
  const token = await getToken();
  const imgFile = formData.get("image_url");
  const imgFile2 = formData.get("banner");
  let image_url = null;
  let banner = null;
  if (imgFile.name) {
    image_url = await handleImageUpload(formData, "image_url");
  }
  if (imgFile2.name) {
    banner = await handleImageUpload(formData, "banner");
  }
  const name = formData.get("name");
  const description = formData.get("description");
  const is_featured = formData.get("is_featured") === "on";
  const newFormData = new FormData();
  if (banner) {
    newFormData.append("banner", banner);
  }
  if(image_url){
    newFormData.append("image_url", image_url);
  }
  newFormData.append("name", name);
  newFormData.append("description", description);
  newFormData.append("is_featured", is_featured ? 1 : 0);
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API}/save-category`,
      newFormData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    revalidateTag("categories");
    return {
      status: res.data.status,
      success: res.data.success,
      message: res.data.message,
    };
  } catch (error) {
    console.log(error);
  }
};

export const updateCategory = async (id,formData) => {
  const token = await getToken();
  const imgFile = formData.get("image_url");
  const imgFile2 = formData.get("banner");
  let image_url = null;
  let banner = null;
  if (imgFile instanceof File) {
    image_url = await handleImageUpload(formData, "image_url");
  }
  if (imgFile2 instanceof File) {
    banner = await handleImageUpload(formData, "banner");
  }
  const name = formData.get("name");
  const description = formData.get("description");
  const is_featured = formData.get("is_featured");
  const newFormData = new FormData();
  if (banner) {
    newFormData.append("banner", banner);
  }
  if(image_url){
    newFormData.append("image_url", image_url);
  }
  newFormData.append("name", name);
  newFormData.append("categoryId", id);
  newFormData.append("description", description);
  newFormData.append("is_featured", is_featured ? 1 : 0);
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API}/update-category`,
      newFormData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    revalidateTag("categories");
    if(!res.data.success){
      return {
        message: res.data.errors.categoryId[0],
      };
    }
    return {
      status: res.data.status,
      success: res.data.success,
      message: res.data.message,
    };
  } catch (error) {
    return {
      message: error.data.errors.categoryId[0]
    };
  }
};


export const updateCampaign = async (id,formData) => {
  const token = await getToken();
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API}/campaigns/${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    revalidatePath("/ecommerce/campaign");
    if (!res.data.success) {
      return {
        message: res.data.errors,
      };
    }
    return {
      status: res.data.status,
      success: res.data.success,
      message: res.data.message,
    };
  } catch (error) {
    const [field,message] = Object.entries(error.response.data.errors)[0];
    throw new Error(message[0]) ;
  }
}


export const addCampaign = async (formData) => {
  const token = await getToken();
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API}/campaigns`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(res)
    revalidatePath("/ecommerce/campaign");
    if (!res.data.success) {
      return {
        message: res.data.errors,
      };
    }
    return {
      status: res.data.status,
      success: res.data.success,
      message: res.data.message,
    };
  } catch (error) {
    const [field,message] = Object.entries(error.response.data.errors)[0];
    return {
      status : error.response.status,
      message: error.response.data.message || message[0],
      product_name : error.response.data.product_name,
      success : error.response.data.success
    };
  }
}

export const deleteCampaign = async (id) => {
  const token = await getToken();
  try {
    const res = await axios.delete(
      `${process.env.NEXT_PUBLIC_API}/campaigns/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    revalidateTag("campaigns");
    return {
      success: res.data.success,
      status: res.data.status,
      message : res.data.message
    };
  } catch (error) {
    return {
      status: 422,
      success: false,
      message: error.response.data.message,
    };
  }
};


export const createSubCategory = async (formData) => {
  const token = await getToken();
  const categoryId = formData.get("category_id");
  const name = formData.get("name");
  const images = formData.getAll('images');
  const banners = formData.getAll('banners');
  let imageUrls = null;
  let bannerUrls = null;
  if(images.length){
    imageUrls = await handleMultipleImageUpload(formData, "images");
  }
  if(banners.length){
    bannerUrls = await handleMultipleImageUpload(formData, "banners");
  }

  const newFormData = new FormData();
  newFormData.append("category_id", categoryId);
  newFormData.append("name", name);
  if(imageUrls.length){
    imageUrls.forEach(item => {
      newFormData.append('images[]',item.path);
    })
  }
  if(bannerUrls.length){
    bannerUrls.forEach(item => {
      newFormData.append('banners[]',item.path);
    })
  }

  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API}/save-sub-category 
`,
      newFormData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    revalidateTag("subcategories");
    if(res.data.status !== 200){
      const [field,message] = Object.entries(res.data.errors)[0]
      return {
        status : res.data.status,
        success : res.data.success,
        message : message[0]
      }
    }
    return {
      status: res.data.status,
      success: res.data.success,
      message: res.data.message,
    };
  } catch (error) {
    console.log(error);
  }
};

const validateImagesFile = (images) => {
  if (!Array.isArray(images) || images.length === 0) return false;

  return images.every((item) => item instanceof File);
}

const extractUrls = (images) => {
  if (!Array.isArray(images)) return [];
  return images
    .filter((i) => !(i instanceof File))
    .flatMap((i) =>
      typeof i === "string"
        ? i.split(",").map((url) => url.trim())
        : i.path
        ? [i.path]
        : []
    );
}

export const updateSubCategory = async (formData) => {
  const token = await getToken();
  const categoryId = formData.get("category_id");
  const subId = formData.get("subCategoryId");
  const name = formData.get("name");
  const images = formData.getAll('images');
  
  const banners = formData.getAll('banners');
  let imageUrls = null;
  let bannerUrls = null;
  if(validateImagesFile(images)){
    imageUrls = await handleMultipleImageUpload(formData, "images");
  }else{
    imageUrls = extractUrls(images)
  }
  if(validateImagesFile(banners)){
    bannerUrls = await handleMultipleImageUpload(formData, "banners");
  }else{
    bannerUrls = extractUrls(banners)
  }

  const newFormData = new FormData();
  newFormData.append("category_id", categoryId);
  newFormData.append("subCategoryId", subId);
  newFormData.append("name", name);

  if(imageUrls?.length){
    imageUrls.forEach(item => {
      newFormData.append('images[]',item.path ? item.path : item);
    })
  }

  if(bannerUrls?.length){
    bannerUrls.forEach(item => {
      newFormData.append("banners[]", item.path ? item.path : item);
    })
  }

  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API}/update-sub-category 
`,
      newFormData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(res)
    revalidateTag("subcategories");
    if(res.data.status !== 200){
      const [field,message] = Object.entries(res.data.errors)[0]
      return {
        status : res.data.status,
        success : res.data.success,
        message : message[0]
      }
    }
    return {
      status: res.data.status,
      success: res.data.success,
      message: res.data.message,
    };
  } catch (error) {
    console.log(error);
  }
};

export const deleteSubCategory = async (id) => {
  const token = await getToken();
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API}/delete-sub-category`,
      { subCategoryId : id},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    revalidateTag("subcategories");
    return {
      success: res.data.success,
      status: res.data.status,
      message: res.data.message,
    };
  } catch (error) {
    return {
      status: 422,
      success: false,
      message: error.response.data.message,
    };
  }
};

