import React, { useState } from "react";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { toastOptions } from "@/lib/lib";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";

const Post = ({ pdata }) => {
  const { data: session } = useSession();
  console.log(session);
  const [show, setShow] = useState(true);
  const [postLiked, setPostLiked] = useState(false);
  const router = useRouter();
  // console.log(pdata.createdAt);
  const elapsedTime = Date.now() - new Date(pdata.createdAt).getTime();
  const minutes = Math.floor((elapsedTime / 1000 / 60) % 60);
  const hours = Math.floor((elapsedTime / 1000 / 60 / 60) % 24);
  const days = Math.floor(elapsedTime / 1000 / 60 / 60 / 24);

  let timeString = "";
  if (days > 0) {
    timeString = `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (hours > 0) {
    timeString = `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else {
    timeString = `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }

  const handleLike = async () => {
    setPostLiked(!postLiked);
    await axios.post(`/api/user/feedPost/${pdata._id}`, {
      userId: session.user.id,
      liked: postLiked,
    });
    console.log("hello");
  };

  const refreshData = () => {
    router.replace(router.asPath);
  };

  const onSubmit = async (values, error) => {
    const { content } = values;
    const res = await axios.put(`/api/user/comment/${pdata._id}`, {
      name: session?.user.name,
      profile: session?.user.profile,
      content,
    });

    if (res.status === 200) {
      toast.success(res.data.msg, toastOptions);
      setTimeout(refreshData, 4000);
    } else {
      toast.error(res.data.msg, toastOptions);
    }
  };

  const formik = useFormik({
    initialValues: {
      content: "",
    },
    onSubmit,
  });
  // console.log(pdata.likeCount);
  return (
    <div className="flex flex-col">
      <div className="p-5 bg-lightMode-component dark:bg-darkMode-component mt-5 rounded-t-lg shadow-sm flex flex-col text-lightMode-txt dark:text-darkMode-txt">
        <div className="flex flex-row justify-between">
          <div className="flex flex-row ">
            <div className="flex items-center space-x-2 flex-row">
              <img
                className="rounded-full w-10 h-10"
                src={pdata?.userId.profile}
              />
            </div>
            <div className="ml-3">
              <p className="font-medium">{pdata.userId.fullname}</p>
              <p className="text-xs text-gray-400">{timeString}</p>
            </div>
          </div>
          <Link href={`/feed/${pdata._id}`}>
            <button className="text-black dark:text-white">
              <span class="material-symbols-outlined">open_in_new</span>
            </button>
          </Link>
        </div>

        <p className="mt-2">{pdata.description}</p>
      </div>
      <div className=" flex justify-center align-center md-h-96 bg-zinc-300 dark:bg-neutral-800">
        <img src={pdata.image} className="object-contain max-h-[17rem]" />
      </div>
      {/* Footer */}
      <div className="flex flex-col rounded-b-lg bg-lightMode-component dark:bg-darkMode-component text-neutral-700 dark:text-neutral-400 border-t p-2">
        <div className="flex justify-between items-center gap-9 mx-10 mb-2">
          <div
            onClick={handleLike}
            className="rounded-lg cursor-pointer flex items-center space-x-1 hover:bg-neutral-300 dark:hover:bg-neutral-500 dark:hover:text-white justify-center p-1"
          >
            {postLiked ? (
              <span className="text-xl">❤️ </span>
            ) : (
              <span className="text-xl">🤍 </span>
            )}

            <div
              style={{
                paddingRight: "10px",
                whiteSpace: "nowrap",
                display: "inline-block",
              }}
            >
              {pdata.likeBy.length}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShow(!show)}
            className="rounded-lg cursor-pointer flex items-center space-x-1 hover:bg-neutral-300 dark:hover:bg-neutral-500 dark:hover:text-white justify-center p-2 px-3"
          >
            <span class="material-symbols-outlined">chat</span>
            <p className="text-xs sm:text-base ">Comment</p>
          </button>

          <div className="rounded-lg cursor-pointer flex items-center space-x-1 hover:bg-neutral-300 dark:hover:bg-neutral-500 dark:hover:text-white justify-center p-2 px-3">
            <span class="material-symbols-outlined">share</span>
            <p className="text-xs sm:text-base">Share</p>
          </div>
        </div>
        {show && (
          <div
            id="CommentSection"
            className=" flex mx-4 space-x-4 p-4 items-center border-t-[1px] border-neutral-400 dark:border-neutral-600"
          >
            <img className="rounded-full w-8 h-8" src={session?.user.profile} />
            <form
              action=""
              className="flex flex-1 "
              onSubmit={formik.handleSubmit}
            >
              <input
                type="text"
                className="rounded-full h-8 bg-gray-100 dark:bg-neutral-800  flex flex-grow px-5 focus:outline-none "
                placeholder="Write a comment.."
                {...formik.getFieldProps("content")}
              />
              <button type="submit" className="ml-4">
                <span class="material-symbols-outlined">send</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Post;
