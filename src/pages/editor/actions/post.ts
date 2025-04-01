"use server";

import prismaClient from "../../../prisma/client";

export const savePost = async ({
  title,
  content,
}: {
  title: string;
  content: string;
}) => {
  console.log("In savePost");
  const savedPost = await prismaClient.post.create({
    data: {
      title,
      content,
    },
  });

  return savedPost;
};
