import React, { useEffect, useState, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import Nav from "../components/Nav";
import ImageTool from "@editorjs/image";
import CodeTool from "@editorjs/code";
import Embed from "@editorjs/embed";
import Quote from "@editorjs/quote";
import useApi from "../components/useApi";
import { useSelector } from "react-redux";

const AddPost = () => {
  const api = useApi();
  const ejsInstance = useRef(null);
  const [canSave, setCanSave] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // if (!user) {
    //   console.log('No user found')
    //   return;
    // }

    const timer = setTimeout(() => {
      if (!ejsInstance.current) {
        const editor = new EditorJS({
          holder: "editorjs",
          onReady: () => {
            ejsInstance.current = editor;
            console.log("EditorJS is ready to work!!");
          },
          autofocus: true,
          onChange: async () => {
            try {
              let content = await editor.save();

              let hasHeading = false;
              let hasPara = false;

              for (const block of content.blocks) {
                if (block.type === "header" && block.data.text.trim() !== "") {
                  hasHeading = true;
                }

                if (
                  block.type === "paragraph" &&
                  block.data.text.trim().length >= 50
                ) {
                  hasPara = true;
                }
              }

              setCanSave(hasHeading && hasPara);
            } catch (err) {
              console.error("Error checking content validity:", err);
            }
          },
          tools: {
            header: {
              class: Header,
              inlineToolbar: true,
              config: {
                placeholder: "Enter Title...",
                levels: [1, 2, 3, 4, 5, 6],
                defaultLevel: 1,
              },
            },
            image: {
              class: ImageTool,
              config: {
                endpoints: {
                  byFile: "http://localhost:8000/api/posts/upload-image/",
                  byUrl: "http://localhost:8000/api/posts/fetch-url/",
                },
                field: user?.username
                  ? `${user.username}-post-image`
                  : "post-image",
                types: "image/*",
              },
            },
            code: CodeTool,
            quote: Quote,
            embed: Embed,
          },
          data: {
            blocks: [
              {
                type: "header",
                data: {
                  text: "",
                  level: 1,
                },
              },
            ],
          },
        });
      }
    }, 100);

    return () => {
      clearTimeout(timer);

      if (ejsInstance.current) {
        try {
          ejsInstance.current.destroy();
          ejsInstance.current = null;
        } catch (error) {
          console.error("Error destroying editor:", error);
        }
      }
    };
  }, [user]);

  const handlePostSave = async () => {
    if (!ejsInstance.current) {
      console.error("Editor instance not found");
      return;
    }

    try {
      const savedContent = await ejsInstance.current.save();

      if (
        !savedContent ||
        !savedContent.blocks ||
        savedContent.blocks.length === 0
      ) {
        console.error("No content blocks found in editor");
        return;
      }

      let title = "Untitled Post";
      const firstBlock = savedContent.blocks[0];
      if (
        firstBlock &&
        firstBlock.type === "header" &&
        firstBlock.data &&
        firstBlock.data.text
      ) {
        title = firstBlock.data.text.trim() || title;
      }

      const payload = {
        content: savedContent,
        title: title,
      };

      console.log("This is the saved content:", payload);

      const response = await api.post("posts/create-posts/", payload);

      if (response.status === 201) {
        console.log(`Post saved successfully 🎉🎉🎉🎉`);
      }
    } catch (error) {
      console.error(`Error while saving post: ${error}`);
    }
  };

  return (
    <div className="h-screen overflow-auto bg-zinc-100 dark:bg-gray-800 transition-colors duration-300">
      <Nav />
      <div className="p-6 dark:text-white font-montserrat">
        <div id="editorjs" className="editor-container" />

        <div className="flex justify-end mt-3">
          <button
            disabled={!canSave}
            onClick={handlePostSave}
            className={`px-4 py-2 rounded-md transition-all duration-300 cursor-pointer ${
              canSave
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-green-700 text-gray-200 cursor-not-allowed"
            }`}
          >
            Publish Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPost;
