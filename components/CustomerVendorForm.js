"use client"

import { useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Camera, Upload, Crown, X } from "lucide-react"
import { useParams, usePathname, useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import Image from "next/image"
import { imageUpload, resetPreview, setPreview } from "@/app/store/imageSlice"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { useGetBloodGroupQuery } from "@/app/store/api/profileApi"
import { useUpdateVendorDetailsMutation } from "@/app/store/api/purchaseVendorApi"
import { useUpdateCustomerDetailsMutation } from "@/app/store/api/saleCustomerApi"


export default function CustomerVendorForm({ data, id }) {
    const { data: session } = useSession();
    const router = useRouter();
    const pathName = usePathname();
    const party = pathName.includes('purchase');
    const [membershipEnabled, setMembershipEnabled] = useState(0);
    const [formData, setFormData] = useState({
        name: "",
        mobile_number: "",
        email: "",
        nid: "",
        blood_group: "",
        address: "",
        is_member: membershipEnabled,
        image: "",
    })
    const imageRef = useRef(null);
    const dispatch = useDispatch();
    const imagePreview = useSelector((state) => state.image.preview);
    const [imageFile, setImageFile] = useState("");

    const [updateVendorDetails] = useUpdateVendorDetailsMutation();
    const [updateCustomerDetails] = useUpdateCustomerDetailsMutation();
    const { data: bloodGroup } = useGetBloodGroupQuery(undefined);



    useMemo(() => {
        if(party){
            setFormData((prev) => ({
                ...prev,
                name: data?.data?.name,
                mobile_number: data?.data?.mobile_number,
                email: data?.data?.email,
                nid: data?.data?.nid,
                blood_group: data?.data?.blood_group,
                address: data?.data?.address,
                is_member: data?.data?.is_member,
                image: data?.data?.image,
                id: Number(id),
                vendor_id : Number(id)
            }))
        }else {
            setFormData((prev) => ({
                ...prev,
                name: data?.data?.name,
                mobile_number: data?.data?.mobile_number,
                email: data?.data?.email,
                nid: data?.data?.nid,
                blood_group: data?.data?.blood_group,
                address: data?.data?.address,
                is_member: data?.data?.is_member,
                image: data?.data?.image,
                id: Number(id),
            }))
        }
        setMembershipEnabled(data?.data?.is_member)
    }, [data?.data, id])

    const handleBack = () => {
        router.back();
    }

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const membershipUpdate = () => {
        setMembershipEnabled((prev) => {
            const toggled = prev ^ 1; // toggle 0/1
            setFormData((form) => ({
                ...form,
                is_member: toggled
            }));
            return toggled;
        });
    }

    const handleFileChange = (e) => {
        const files = e.target.files[0];
        const preview = URL.createObjectURL(files);
        setImageFile(files);
        dispatch(setPreview(preview));
    }


    const handleRemoveImage = () => {
        dispatch(resetPreview());
        setFormData((prev) => ({
            ...prev,
            image: ""
        }))
    }


    const handleSubmit = async () => {

        let payload = { ...formData };
        if (imageFile) {
            try {
                const res = await dispatch(imageUpload({
                    image: imageFile,
                    token: session?.accessToken
                })).unwrap();
                if (res) {
                    payload = { ...formData, image: res }
                }
            } catch (error) {
                toast.error("Error Occured in image upload");
            }
        }

        try {
            const response = party ? await updateVendorDetails(payload).unwrap() : await updateCustomerDetails(payload).unwrap();
            if (response.success) {
                toast.success(response.message);
            } else {
                toast.error("Error Occured")
            }
        } catch (error) {
            toast.error(error.message);
        }
    }


    return (
        <div className="min-h-screen bg-gray-50 p-4 rounded-2xl">
            <div className="">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Button onClick={handleBack} variant="ghost" size="sm" className="p-2 h-auto">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-semibold text-gray-900">Edit Customer</h1>
                </div>

                <div className="space-y-6">
                    {/* Profile Photo Section */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="relative">
                                    {
                                        imagePreview ?
                                            <>
                                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                                    <Image
                                                        src={imagePreview || formData.image}
                                                        height={96}
                                                        width={96}
                                                        alt="uploaded-image"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                {/* Remove Button */}
                                                <input
                                                    type="file"
                                                    ref={imageRef}
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                />
                                                <Button
                                                    onClick={handleRemoveImage}
                                                    size="sm"
                                                    variant="destructive"
                                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                                {/* Edit/Replace Button */}
                                                <Button
                                                    onClick={() => imageRef.current?.click()}
                                                    size="sm"
                                                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-blue-600 hover:bg-blue-700"
                                                >
                                                    <Upload className="h-4 w-4" />
                                                </Button>
                                            </> :
                                            <>
                                                {
                                                    formData.image ?
                                                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                                            <Image
                                                                src={formData.image ?? ""}
                                                                height={96}
                                                                width={96}
                                                                alt="uploaded-image"
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <Button
                                                                onClick={handleRemoveImage}
                                                                size="sm"
                                                                variant="destructive"
                                                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </div> :
                                                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                                                            <Camera className="h-8 w-8 text-blue-600" />
                                                        </div>
                                                }
                                                <input
                                                    type="file"
                                                    ref={imageRef}
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                />
                                                <Button
                                                    onClick={() => imageRef.current?.click()}
                                                    size="sm"
                                                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-blue-600 hover:bg-blue-700"
                                                >
                                                    <Upload className="h-4 w-4" />
                                                </Button>
                                            </>
                                    }

                                </div>
                                <p className="text-sm text-gray-500">Supports: JPG, JPEG, PNG</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Information */}
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                                        Name
                                    </Label>
                                    <Input
                                        id="name"
                                        value={formData.name ?? ""}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        className="mt-1"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="mobile_number" className="text-sm font-medium text-gray-700">
                                            Phone
                                        </Label>
                                        <Input
                                            id="mobile_number"
                                            value={formData.mobile_number ?? ""}
                                            onChange={(e) => handleInputChange("mobile_number", e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter email address"
                                            value={formData.email ?? ""}
                                            onChange={(e) => handleInputChange("email", e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="nid" className="text-sm font-medium text-gray-700">
                                        NID
                                    </Label>
                                    <Input
                                        id="nid"
                                        placeholder="Enter NID number"
                                        value={formData.nid ?? ""}
                                        onChange={(e) => handleInputChange("nid", e.target.value)}
                                        className="mt-1"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="bloodGroup" className="text-sm font-medium text-gray-700">
                                            Blood Group
                                        </Label>
                                        <Select
                                            value={formData.blood_group ?? ""}
                                            onValueChange={(value) => handleInputChange("blood_group", value)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select Blood Group" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {
                                                    bloodGroup?.data && bloodGroup?.data?.length ?
                                                        bloodGroup.data.map(item => (
                                                            <SelectItem key={item.id} value={item.id}>{item.blood_group_name}</SelectItem>
                                                        )) : ""
                                                }
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                                        Address
                                    </Label>
                                    <Textarea
                                        id="address"
                                        value={formData.address ?? ""}
                                        onChange={(e) => handleInputChange("address", e.target.value)}
                                        className="mt-1 min-h-[80px]"
                                        placeholder="Enter full address"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Membership Section */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                    <div className="bg-amber-100 p-2 rounded-lg">
                                        <Crown className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Membership</h3>
                                        <p className="text-sm text-gray-500 mt-1">Members can get additional discount and benefits</p>
                                    </div>
                                </div>
                                <Switch className="data-[state=checked]:bg-blue-500" checked={membershipEnabled} onCheckedChange={membershipUpdate} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Save Button */}
                    <Button onClick={handleSubmit} className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700">Save Changes</Button>
                </div>
            </div>
        </div>
    )
}
