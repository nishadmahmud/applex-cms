"use client";

import React, { useRef, useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TextAlign } from "@tiptap/extension-text-align";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { CharacterCount } from "@tiptap/extension-character-count";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Youtube } from "@tiptap/extension-youtube";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Undo,
  Redo,
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link2,
  ImageIcon,
  Video,
  TableIcon,
  Minus,
  Quote,
  Eraser,
  Highlighter,
  Smile,
  AtSign,
  SubscriptIcon,
  SuperscriptIcon,
  IndentDecrease,
  IndentIncrease,
  Save,
  MoreHorizontal,
  Type,
  Paperclip,
} from "lucide-react";
import { Loader2 } from "lucide-react";

const TiptapEditor = ({
  value,
  onChange,
  placeholder = "Press '/' for commands",
  className = "",
  onImageUpload,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [pendingImages, setPendingImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageConfig, setImageConfig] = useState({
    alt: "",
    link: "",
    width: "100",
    alignment: "center",
  });
  const [linkUrl, setLinkUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [tableConfig, setTableConfig] = useState({ rows: 3, cols: 3 });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [highlightColor, setHighlightColor] = useState("#ffff00");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Subscript,
      Superscript,
      CharacterCount.configure({
        limit: 50000,
      }),
      Placeholder.configure({
        placeholder: placeholder,
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] max-w-none p-4",
      },
    },
    immediatelyRender: false,
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    e.target.value = "";

    if (!onImageUpload) {
      alert(
        "Image upload handler is not configured. Please provide onImageUpload prop."
      );
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      const uploadedUrls = await onImageUpload(files);

      const uploadedImages = files.map((file, index) => ({
        file,
        url: uploadedUrls[index],
        name: file.name,
      }));

      setPendingImages(uploadedImages);
      setCurrentImageIndex(0);
      setImageConfig({
        alt: "",
        link: "",
        width: "100",
        alignment: "center",
      });
      setShowImageDialog(true);
    } catch (error) {
      setUploadError("Failed to upload images. Please try again.");
      console.error("[v0] Image upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const insertCurrentImage = () => {
    if (!editor || pendingImages.length === 0) return;

    const currentImage = pendingImages[currentImageIndex];
    const imageUrl = currentImage.url;

    editor.chain().focus().setImage({ src: imageUrl }).run();

    if (currentImageIndex < pendingImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setImageConfig({
        alt: "",
        link: "",
        width: "100",
        alignment: "center",
      });
    } else {
      setShowImageDialog(false);
      setPendingImages([]);
      setCurrentImageIndex(0);
    }
  };

  const skipCurrentImage = () => {
    if (currentImageIndex < pendingImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setImageConfig({
        alt: "",
        link: "",
        width: "100",
        alignment: "center",
      });
    } else {
      setShowImageDialog(false);
      setPendingImages([]);
      setCurrentImageIndex(0);
    }
  };

  const setLink = () => {
    if (!linkUrl) {
      editor.chain().focus().unsetLink().run();
      setShowLinkDialog(false);
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: linkUrl })
      .run();

    setShowLinkDialog(false);
    setLinkUrl("");
  };

  const addYoutubeVideo = () => {
    if (videoUrl) {
      editor.commands.setYoutubeVideo({
        src: videoUrl,
        width: 640,
        height: 480,
      });
      setShowVideoDialog(false);
      setVideoUrl("");
    }
  };

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({
        rows: Number.parseInt(tableConfig.rows),
        cols: Number.parseInt(tableConfig.cols),
        withHeaderRow: true,
      })
      .run();
    setShowTableDialog(false);
  };

  const applyTextColor = (color) => {
    editor.chain().focus().setColor(color).run();
    setTextColor(color);
  };

  const applyHighlight = (color) => {
    editor.chain().focus().setHighlight({ color }).run();
    setHighlightColor(color);
  };

  if (!isMounted || !editor) {
    return (
      <div className={`tiptap-editor-wrapper border rounded-lg ${className}`}>
        <div className="min-h-[200px] flex items-center justify-center text-gray-400">
          <p>Loading editor...</p>
        </div>
      </div>
    );
  }

  const characterCount = editor.storage.characterCount.characters();

  return (
    <div className={`tiptap-editor-wrapper border rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1 items-center sticky top-0 z-10">
        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>

        {/* Clear Formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
          title="Clear Formatting"
        >
          <Eraser className="h-4 w-4" />
        </Button>

        {/* Save Button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const content = editor.getHTML();
            console.log("[v0] Saved content:", content);
          }}
          title="Save"
        >
          <Save className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Font Family Dropdown */}
        <Select
          defaultValue="default"
          onValueChange={(value) => {
            if (value === "default") {
              editor.chain().focus().unsetFontFamily().run();
            }
          }}
        >
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue placeholder="Default" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="serif">Serif</SelectItem>
            <SelectItem value="mono">Monospace</SelectItem>
          </SelectContent>
        </Select>

        {/* Heading Dropdown */}
        <Select
          value={
            editor.isActive("heading", { level: 1 })
              ? "h1"
              : editor.isActive("heading", { level: 2 })
              ? "h2"
              : editor.isActive("heading", { level: 3 })
              ? "h3"
              : editor.isActive("heading", { level: 4 })
              ? "h4"
              : editor.isActive("heading", { level: 5 })
              ? "h5"
              : editor.isActive("heading", { level: 6 })
              ? "h6"
              : "paragraph"
          }
          onValueChange={(value) => {
            if (value === "paragraph") {
              editor.chain().focus().setParagraph().run();
            } else {
              const level = Number.parseInt(value.replace("h", ""));
              editor.chain().focus().setHeading({ level }).run();
            }
          }}
        >
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue placeholder="Paragraph" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paragraph">Paragraph</SelectItem>
            <SelectItem value="h1">Heading 1</SelectItem>
            <SelectItem value="h2">Heading 2</SelectItem>
            <SelectItem value="h3">Heading 3</SelectItem>
            <SelectItem value="h4">Heading 4</SelectItem>
            <SelectItem value="h5">Heading 5</SelectItem>
            <SelectItem value="h6">Heading 6</SelectItem>
          </SelectContent>
        </Select>

        {/* Font Size Dropdown */}
        <Select defaultValue="default">
          <SelectTrigger className="w-[100px] h-8 text-xs">
            <SelectValue placeholder="Default" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Text Formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-gray-200" : ""}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-gray-200" : ""}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "bg-gray-200" : ""}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "bg-gray-200" : ""}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Text Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm" title="Text Color">
              <Type className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-2">
              <Label>Text Color</Label>
              <Input
                type="color"
                value={textColor}
                onChange={(e) => applyTextColor(e.target.value)}
                className="h-10 w-full"
              />
              <div className="grid grid-cols-6 gap-2">
                {[
                  "#000000",
                  "#FF0000",
                  "#00FF00",
                  "#0000FF",
                  "#FFFF00",
                  "#FF00FF",
                  "#00FFFF",
                  "#FFA500",
                  "#800080",
                  "#008000",
                  "#FFC0CB",
                  "#A52A2A",
                ].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500"
                    style={{ backgroundColor: color }}
                    onClick={() => applyTextColor(color)}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Highlight Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm" title="Highlight">
              <Highlighter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-2">
              <Label>Highlight Color</Label>
              <Input
                type="color"
                value={highlightColor}
                onChange={(e) => applyHighlight(e.target.value)}
                className="h-10 w-full"
              />
              <div className="grid grid-cols-6 gap-2">
                {[
                  "#FFFF00",
                  "#00FF00",
                  "#00FFFF",
                  "#FF00FF",
                  "#FFA500",
                  "#FFC0CB",
                  "#90EE90",
                  "#ADD8E6",
                  "#FFB6C1",
                  "#FFDAB9",
                  "#E6E6FA",
                  "#F0E68C",
                ].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500"
                    style={{ backgroundColor: color }}
                    onClick={() => applyHighlight(color)}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Emoji Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm" title="Emoji">
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="grid grid-cols-8 gap-2">
              {[
                "😀",
                "😃",
                "😄",
                "😁",
                "😆",
                "😅",
                "😂",
                "🤣",
                "😊",
                "😇",
                "🙂",
                "🙃",
                "😉",
                "😌",
                "😍",
                "🥰",
                "😘",
                "😗",
                "😙",
                "😚",
                "😋",
                "😛",
                "😝",
                "😜",
                "🤪",
                "🤨",
                "🧐",
                "🤓",
                "😎",
                "🤩",
                "🥳",
                "😏",
              ].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="text-2xl hover:bg-gray-100 rounded p-1"
                  onClick={() => {
                    editor.chain().focus().insertContent(emoji).run();
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Alignment */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={
            editor.isActive({ textAlign: "left" }) ? "bg-gray-200" : ""
          }
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={
            editor.isActive({ textAlign: "center" }) ? "bg-gray-200" : ""
          }
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={
            editor.isActive({ textAlign: "right" }) ? "bg-gray-200" : ""
          }
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={
            editor.isActive({ textAlign: "justify" }) ? "bg-gray-200" : ""
          }
          title="Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Lists */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-gray-200" : ""}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-gray-200" : ""}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        {/* Indent */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().outdent().run()}
          title="Decrease Indent"
        >
          <IndentDecrease className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().indent().run()}
          title="Increase Indent"
        >
          <IndentIncrease className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Link */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const previousUrl = editor.getAttributes("link").href;
            setLinkUrl(previousUrl || "");
            setShowLinkDialog(true);
          }}
          className={editor.isActive("link") ? "bg-gray-200" : ""}
          title="Insert Link"
        >
          <Link2 className="h-4 w-4" />
        </Button>

        {/* Image */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleImageUpload}
          title="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        {/* Video */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowVideoDialog(true)}
          title="Insert Video"
        >
          <Video className="h-4 w-4" />
        </Button>

        {/* @ Mention */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().insertContent("@").run()}
          title="Mention"
        >
          <AtSign className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Blockquote */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "bg-gray-200" : ""}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </Button>

        {/* Code Block */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive("codeBlock") ? "bg-gray-200" : ""}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </Button>

        {/* Horizontal Rule */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus className="h-4 w-4" />
        </Button>

        {/* Table */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowTableDialog(true)}
          title="Insert Table"
        >
          <TableIcon className="h-4 w-4" />
        </Button>

        {/* Subscript/Superscript */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={editor.isActive("subscript") ? "bg-gray-200" : ""}
          title="Subscript"
        >
          <SubscriptIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={editor.isActive("superscript") ? "bg-gray-200" : ""}
          title="Superscript"
        >
          <SuperscriptIcon className="h-4 w-4" />
        </Button>

        {/* File Attachment */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            alert(
              "File attachment feature - implement with your file upload handler"
            );
          }}
          title="Attach File"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* More Options */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              title="More Options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="space-y-2">
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start"
                onClick={() =>
                  editor.chain().focus().clearNodes().unsetAllMarks().run()
                }
              >
                Clear All Formatting
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  const html = editor.getHTML();
                  navigator.clipboard.writeText(html);
                }}
              >
                Copy HTML
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: "none" }}
        disabled={isUploading}
      />

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="min-h-[200px]"
        immediatelyRender={false}
      />

      {/* Character Count */}
      <div className="border-t p-2 text-xs text-gray-500 flex justify-between items-center">
        <span>{characterCount}/50000 CHARACTERS</span>
      </div>

      {/* Loading Overlay */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Uploading images to server...</p>
          </div>
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{uploadError}</p>
        </div>
      )}

      {/* Image Configuration Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Configure Image {currentImageIndex + 1} of {pendingImages.length}
            </DialogTitle>
          </DialogHeader>

          {pendingImages[currentImageIndex] && (
            <div className="space-y-4 py-4">
              <div className="border rounded-lg p-4 bg-gray-50 overflow-hidden">
                <img
                  src={
                    pendingImages[currentImageIndex].url || "/placeholder.svg"
                  }
                  alt="Preview"
                  style={{
                    width: `${imageConfig.width}%`,
                    maxWidth: "100%",
                    height: "auto",
                    display: "block",
                    margin:
                      imageConfig.alignment === "center"
                        ? "0 auto"
                        : imageConfig.alignment === "left"
                        ? "0 auto 0 0"
                        : "0 0 0 auto",
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alt-text">
                  Alt Text <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="alt-text"
                  placeholder="Describe the image for accessibility and SEO"
                  value={imageConfig.alt}
                  onChange={(e) =>
                    setImageConfig({ ...imageConfig, alt: e.target.value })
                  }
                />
                <p className="text-xs text-gray-500">
                  Required for SEO and accessibility
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="link-url">Link URL (Optional)</Label>
                <Input
                  id="link-url"
                  placeholder="https://example.com"
                  value={imageConfig.link}
                  onChange={(e) =>
                    setImageConfig({ ...imageConfig, link: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="width">Width: {imageConfig.width}%</Label>
                <input
                  id="width"
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={imageConfig.width}
                  onChange={(e) =>
                    setImageConfig({ ...imageConfig, width: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alignment">Alignment</Label>
                <Select
                  value={imageConfig.alignment}
                  onValueChange={(value) =>
                    setImageConfig({ ...imageConfig, alignment: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">
                      Left (allows text wrap)
                    </SelectItem>
                    <SelectItem value="center">Center (block)</SelectItem>
                    <SelectItem value="right">
                      Right (allows text wrap)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={skipCurrentImage}>
              Skip This Image
            </Button>
            <Button
              onClick={insertCurrentImage}
              disabled={!imageConfig.alt.trim()}
            >
              Insert Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-url-input">URL</Label>
              <Input
                id="link-url-input"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={setLink}>Insert Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Dialog */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert YouTube Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="video-url-input">YouTube URL</Label>
              <Input
                id="video-url-input"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVideoDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addYoutubeVideo}>Insert Video</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table Dialog */}
      <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Table</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="table-rows">Rows</Label>
              <Input
                id="table-rows"
                type="number"
                min="1"
                max="10"
                value={tableConfig.rows}
                onChange={(e) =>
                  setTableConfig({ ...tableConfig, rows: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="table-cols">Columns</Label>
              <Input
                id="table-cols"
                type="number"
                min="1"
                max="10"
                value={tableConfig.cols}
                onChange={(e) =>
                  setTableConfig({ ...tableConfig, cols: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTableDialog(false)}>
              Cancel
            </Button>
            <Button onClick={insertTable}>Insert Table</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .tiptap-editor-wrapper .ProseMirror {
          outline: none;
        }

        .tiptap-editor-wrapper
          .ProseMirror
          p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }

        .tiptap-editor-wrapper .ProseMirror img {
          max-width: 100%;
          height: auto;
          cursor: pointer;
        }

        .tiptap-editor-wrapper .ProseMirror img:hover {
          outline: 2px solid #3b82f6;
        }

        .tiptap-editor-wrapper .ProseMirror table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 1rem 0;
          overflow: hidden;
        }

        .tiptap-editor-wrapper .ProseMirror table td,
        .tiptap-editor-wrapper .ProseMirror table th {
          min-width: 1em;
          border: 2px solid #ced4da;
          padding: 0.5rem;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }

        .tiptap-editor-wrapper .ProseMirror table th {
          font-weight: bold;
          text-align: left;
          background-color: #f1f3f5;
        }

        .tiptap-editor-wrapper .ProseMirror blockquote {
          padding-left: 1rem;
          border-left: 3px solid #cbd5e0;
          margin: 1rem 0;
        }

        .tiptap-editor-wrapper .ProseMirror code {
          background-color: #f1f3f5;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.9em;
        }

        .tiptap-editor-wrapper .ProseMirror pre {
          background-color: #1e293b;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
        }

        .tiptap-editor-wrapper .ProseMirror pre code {
          background: none;
          color: inherit;
          padding: 0;
        }

        .tiptap-editor-wrapper .ProseMirror hr {
          border: none;
          border-top: 2px solid #cbd5e0;
          margin: 2rem 0;
        }

        .tiptap-editor-wrapper .ProseMirror ul,
        .tiptap-editor-wrapper .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 1rem 0;
        }

        .tiptap-editor-wrapper .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 1rem 0;
        }

        .tiptap-editor-wrapper .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.8rem 0;
        }

        .tiptap-editor-wrapper .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 0.6rem 0;
        }

        .tiptap-editor-wrapper .ProseMirror a {
          color: #3b82f6;
          text-decoration: underline;
          cursor: pointer;
        }

        .tiptap-editor-wrapper .ProseMirror a:hover {
          color: #2563eb;
        }

        .tiptap-editor-wrapper .ProseMirror mark {
          background-color: #fef08a;
          padding: 0.1rem 0.2rem;
          border-radius: 0.2rem;
        }
      `}</style>
    </div>
  );
};

export default TiptapEditor;
