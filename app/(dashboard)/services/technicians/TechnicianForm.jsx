import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { useSession } from "next-auth/react";
import { imageUpload } from "@/app/store/imageSlice";
import {
    useCreateTechnicianMutation,
    useUpdateTechnicianMutation,
} from "@/app/store/api/techniciansApi";
import { toast } from "sonner";

export default function TechnicianForm({ initialData = null, onClose }) {
    const dispatch = useDispatch();
    const { data: session } = useSession();
    const fileInputRef = useRef(null);

    const [createTechnician, { isLoading: isCreating }] = useCreateTechnicianMutation();
    const [updateTechnician, { isLoading: isUpdating }] = useUpdateTechnicianMutation();

    const [formData, setFormData] = useState({
        name: "",
        nid: "",
        number: "",
        email: "",
        address: "",
        salary: "",
        image: "",
    });

    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [submittingImage, setSubmittingImage] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData?.name || "",
                nid: initialData?.nid || "",
                number: initialData?.number || "",
                email: initialData?.email || "",
                address: initialData?.address || "",
                salary: initialData?.salary || "",
                image: initialData?.image || "",
            });
            if (initialData?.image) {
                setPreview(initialData.image);
            }
        }
    }, [initialData]);

    const handleImageSelect = (file) => {
        if (!file) return;
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const removeImage = () => {
        setImageFile(null);
        setPreview("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmittingImage(true);
        try {
            let imagePath = formData.image;

            if (imageFile) {
                try {
                    imagePath = await dispatch(
                        imageUpload({
                            image: imageFile,
                            token: session?.accessToken || session?.user?.accessToken,
                        })
                    ).unwrap();
                } catch (err) {
                    console.error("Image upload failed:", err);
                    toast.error("Image upload failed");
                    setSubmittingImage(false);
                    return;
                }
            }

            const payload = { ...formData, image: imagePath };

            if (initialData?.id) {
                await updateTechnician({ id: initialData.id, ...payload }).unwrap();
                toast.success("Technician updated successfully");
            } else {
                await createTechnician(payload).unwrap();
                toast.success("Technician created successfully");
            }
            onClose();
        } catch (error) {
            toast.error(error?.data?.message || "Something went wrong");
        } finally {
            setSubmittingImage(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                    <Input
                        id="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="number">Phone Number <span className="text-red-500">*</span></Label>
                    <Input
                        id="number"
                        placeholder="017xxxxxxxx"
                        value={formData.number}
                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="example@mail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="nid">NID</Label>
                    <Input
                        id="nid"
                        placeholder="NID Number"
                        value={formData.nid}
                        onChange={(e) => setFormData({ ...formData, nid: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="salary">Salary</Label>
                <Input
                    id="salary"
                    type="number"
                    placeholder="e.g. 25000"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                    id="address"
                    placeholder="Full Address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label>Technician Image</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    {preview ? (
                        <div className="space-y-3">
                            <img
                                src={preview}
                                alt="Technician"
                                className="h-32 mx-auto object-cover rounded"
                            />
                            <div className="flex justify-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Change
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600"
                                    onClick={removeImage}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Image
                        </Button>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => handleImageSelect(e.target.files[0])}
                    />
                </div>
            </div>

            <div className="pt-4 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating || submittingImage}>
                    {isCreating || isUpdating || submittingImage ? "Saving..." : initialData ? "Update" : "Save"}
                </Button>
            </div>
        </form>
    );
}
